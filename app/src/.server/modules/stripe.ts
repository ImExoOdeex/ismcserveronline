import type { PaymentIntentMetadata } from "@/types/typings";
import plans from "@/utils/plans";
import type { User } from "@prisma/client";
import { json } from "@remix-run/node";
import Stripe from "stripe";
import { toStripeAmount } from "../../functions/payments";
import { db } from "../db/db";
import { newSubscriptionNotify } from "../functions/dmer";
import { requireEnv } from "../functions/env.server";

const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
  typescript: true,
});

export default stripe;

function invariant(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export const paymentHandlers = {
  async createPaymentIntent(amount: number, email: string, days: number) {
    return await stripe.paymentIntents.create({
      amount: toStripeAmount(amount),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email,
      metadata: {
        email,
        type: "sampleServer",
        days,
      },
    });
  },
  async retrievePaymentIntent(paymentId: string) {
    return await stripe.paymentIntents.retrieve(paymentId);
  },
};

export const webhookHandlers = {
  async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(
      "handlePaymentIntentSucceeded",
      JSON.stringify(paymentIntent, null, 2)
    );

    const { userId, subType, serverId } = (paymentIntent as any)
      .subscription_details.metadata;

    if (subType === "server") {
      invariant(serverId, "Missing server id");
      const server = await db.server.update({
        where: {
          id: Number(serverId),
        },
        data: {
          prime: true,
        },
      });
      const user = await db.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          everPurchased: true,
        },
      });
      return json({ server, user }, { status: 200 });
    }
    invariant(userId, "Missing user id");
    const user = await db.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        everPurchased: true,
        prime: true,
      },
    });
    return json({ user }, { status: 200 });
  },
  async handlePaymentIntentProcessing(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // const { sampleServerId } = paymentIntent.metadata as unknown as PaymentIntentMetadata;
    // invariant(sampleServerId, "Missing sample server id");

    // await db.sampleServer.update({
    // 	where: {
    // 		id: Number(sampleServerId)
    // 	},
    // 	data: {
    // 		payment_status: "PROCESSING"
    // 	}
    // });

    return json(null, { status: 200 });
  },
  async handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(
      "handlePaymentIntentFailed",
      JSON.stringify(paymentIntent, null, 2)
    );

    const { userId } = (paymentIntent as any).subscription_details.metadata;
    invariant(userId, "Missing user id");

    const user = await db.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        prime: false,
      },
    });

    return json({ user }, { status: 200 });
  },
  async handlePaymentIntentCancelled(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { sampleServerId } =
      paymentIntent.metadata as unknown as PaymentIntentMetadata;

    if (sampleServerId) {
      // await db.sampleServer.update({
      // 	where: {
      // 		id: Number(sampleServerId)
      // 	},
      // 	data: {
      // 		payment_status: "CANCELLED"
      // 	}
      // });
    } else {
      console.error("Someone cancelled the payment intent");
    }

    return json(
      {
        message:
          "Payment intent cancelled " +
          (sampleServerId
            ? "WITHOUT sample server id"
            : "WITH sample server id"),
      },
      { status: 200 }
    );
  },
  async handleCustomerSubscriptionUpdated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const { userId, subType, serverId } = subscription.metadata;

    if (subType === "server") {
      const server = await db.server.update({
        where: {
          id: Number(serverId),
        },
        data: {
          subId: subscription.id,
          prime: subscription.status === "active",
        },
      });

      const user = await db.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          ad_credits: {
            increment: plans[0].ad_credits,
          },
        },
      });

      return json({ server, user }, { status: 200 });
    }
    const user = await db.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        subId: subscription.id,
        prime: subscription.status === "active",
        ad_credits: {
          increment: plans[1].ad_credits,
        },
      },
    });

    return json({ user }, { status: 200 });
  },
  async handleCustomerSubscriptionCreated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const { userId, subType, serverId } = subscription.metadata;

    if (subType === "server") {
      const user = await db.user.findUniqueOrThrow({
        where: {
          id: Number(userId),
        },
      });
      invariant(serverId, "Missing server id");

      await db.server.update({
        where: {
          id: Number(serverId),
        },
        data: {
          subId: subscription.id,
        },
      });

      newSubscriptionNotify(user.nick, user.email, user.photo);

      return json({ user }, { status: 200 });
    }
    const user = await db.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        subId: subscription.id,
      },
    });

    newSubscriptionNotify(user.nick, user.email, user.photo);

    return json({ user }, { status: 200 });
  },
  async handleCustomerSubscriptionDeleted(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const { userId, subType, serverId } = subscription.metadata;

    if (subType === "server") {
      invariant(serverId, "Missing user id");
      const server = await db.server.update({
        where: {
          id: Number(serverId),
        },
        data: {
          prime: false,
        },
      });

      return json({ server }, { status: 200 });
    }
    invariant(userId, "Missing user id");
    const user = await db.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        prime: false,
      },
    });

    return json({ user }, { status: 200 });
  },
};

export const subscriptionHandlers = {
  async createSubscription(
    user: Pick<User, "email" | "id" | "nick">,
    amount: number,
    serverId?: number,
    coupon?: string
  ) {
    const product = await createProduct(
      user,
      "ismcserver.online prime subscription"
    );
    const customer = await createCustomer(user);

    return await stripe.subscriptions.create({
      customer: customer.id,
      coupon,
      items: [
        {
          price_data: {
            currency: "usd",
            product: product.id,
            unit_amount: toStripeAmount(amount),
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
      metadata: {
        subType: serverId ? "server" : "user",
        userId: user.id,
        email: user.email,
        serverId: serverId ? serverId : null,
      },
    });
  },
  async retrieveSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },
  async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  },
};

async function createCustomer(user: Pick<User, "email" | "id" | "nick">) {
  return await stripe.customers.create({
    email: user.email,
    name: user.nick,
    description: "Customer " + user.email,
    metadata: {
      userId: user.id,
      email: user.email,
    },
  });
}

async function createProduct(
  user: Pick<User, "email" | "id" | "nick">,
  name: string
) {
  return await stripe.products.create({
    name,
    metadata: {
      userId: user.id,
      email: user.email,
    },
  });
}
