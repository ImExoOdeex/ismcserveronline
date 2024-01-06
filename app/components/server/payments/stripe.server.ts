import { User } from "@prisma/client";
import { json } from "@remix-run/node";
import dayjs from "dayjs";
import Stripe from "stripe";
import invariant from "tiny-invariant";
import { PaymentIntentMetadata } from "~/components/types/typings";
import { toStripeAmount } from "~/components/utils/functions/payments";
import { db } from "../db/db.server";

invariant(process.env.STRIPE_SECRET_KEY, "Missing Stripe secret key");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2023-10-16",
	typescript: true
});

export default stripe;

export const paymentHandlers = {
	async createPaymentIntent(amount: number, email: string, days: number) {
		return await stripe.paymentIntents.create({
			amount: toStripeAmount(amount),
			currency: "usd",
			automatic_payment_methods: {
				enabled: true
			},
			receipt_email: email,
			metadata: {
				email,
				type: "sampleServer",
				days
			}
		});
	},
	async retrievePaymentIntent(paymentId: string) {
		return await stripe.paymentIntents.retrieve(paymentId);
	}
};

export const webhookHandlers = {
	async handlePaymentIntentSucceeded(event: Stripe.Event) {
		const paymentIntent = event.data.object as Stripe.PaymentIntent;

		const type = paymentIntent.metadata.type;
		console.log("handlePaymentIntentSucceeded", JSON.stringify(paymentIntent, null, 2));

		switch (type) {
			case "subscription": {
				const { userId } = paymentIntent.metadata;
				invariant(userId, "Missing user id");

				const user = await db.user.update({
					where: {
						id: Number(userId)
					},
					data: {
						everPurchased: true,
						prime: true
					}
				});

				return json({ user }, { status: 200 });
			}
			default: {
				const { sampleServerId, days } = paymentIntent.metadata as unknown as PaymentIntentMetadata;
				invariant(sampleServerId, "Missing sample server id");

				const currentServer = await db.sampleServer.findUnique({
					where: {
						id: Number(sampleServerId)
					}
				});
				invariant(currentServer, "Missing current sample server");

				const newDate = dayjs(currentServer.end_date ?? dayjs())
					.add(days, "day")
					.toDate();

				await db.sampleServer.update({
					where: {
						id: Number(sampleServerId)
					},
					data: {
						payment_id: paymentIntent.id,
						payment_status: "PAID",
						end_date: newDate,
						user: {
							update: {
								everPurchased: true
							}
						}
					}
				});

				return json(null, { status: 200 });
			}
		}
	},
	async handlePaymentIntentProcessing(event: Stripe.Event) {
		const paymentIntent = event.data.object as Stripe.PaymentIntent;
		const { sampleServerId } = paymentIntent.metadata as unknown as PaymentIntentMetadata;
		invariant(sampleServerId, "Missing sample server id");

		await db.sampleServer.update({
			where: {
				id: Number(sampleServerId)
			},
			data: {
				payment_status: "PROCESSING"
			}
		});

		return json(null, { status: 200 });
	},
	async handlePaymentIntentFailed(event: Stripe.Event) {
		const paymentIntent = event.data.object as Stripe.PaymentIntent;

		const type = paymentIntent.metadata.type;
		console.log("handlePaymentIntentFailed", JSON.stringify(paymentIntent, null, 2));

		switch (type) {
			case "subscription": {
				const { userId } = paymentIntent.metadata;
				invariant(userId, "Missing user id");

				const user = await db.user.update({
					where: {
						id: Number(userId)
					},
					data: {
						prime: false
					}
				});

				return json({ user }, { status: 200 });
			}
			default:
				{
					const { sampleServerId } = paymentIntent.metadata as unknown as PaymentIntentMetadata;
					invariant(sampleServerId, "Missing sample server id");

					await db.sampleServer.update({
						where: {
							id: Number(sampleServerId)
						},
						data: {
							payment_status: "FAILED"
						}
					});
				}
				return json(null, { status: 200 });
		}
	},
	async handlePaymentIntentCancelled(event: Stripe.Event) {
		const paymentIntent = event.data.object as Stripe.PaymentIntent;
		const { sampleServerId } = paymentIntent.metadata as unknown as PaymentIntentMetadata;

		if (sampleServerId) {
			await db.sampleServer.update({
				where: {
					id: Number(sampleServerId)
				},
				data: {
					payment_status: "CANCELLED"
				}
			});
		} else {
			console.error("Someone cancelled the payment intent");
		}

		return json(
			{
				message: "Payment intent cancelled " + (sampleServerId ? "WITHOUT sample server id" : "WITH sample server id")
			},
			{ status: 200 }
		);
	},
	async handleCustomerSubscriptionUpdated(event: Stripe.Event) {
		const subscription = event.data.object as Stripe.Subscription;
		const { userId } = subscription.metadata;
		invariant(userId, "Missing user id");

		const user = await db.user.update({
			where: {
				id: Number(userId)
			},
			data: {
				subId: subscription.id,
				prime: subscription.status === "active"
			}
		});

		return json({ user }, { status: 200 });
	},
	async handleCustomerSubscriptionCreated(event: Stripe.Event) {
		const subscription = event.data.object as Stripe.Subscription;
		const { userId } = subscription.metadata;
		invariant(userId, "Missing user id");

		const user = await db.user.update({
			where: {
				id: Number(userId)
			},
			data: {
				subId: subscription.id
			}
		});

		return json({ user }, { status: 200 });
	},
	async handleCustomerSubscriptionDeleted(event: Stripe.Event) {
		const subscription = event.data.object as Stripe.Subscription;
		const { userId } = subscription.metadata;
		invariant(userId, "Missing user id");

		const user = await db.user.update({
			where: {
				id: Number(userId)
			},
			data: {
				prime: false
			}
		});

		return json({ user }, { status: 200 });
	}
};

export const subscriptionHandlers = {
	async createSubscription(user: Pick<User, "email" | "id" | "nick">, amount: number) {
		const product = await createProduct(user, "ismcserver.online prime subscription");
		const customer = await createCustomer(user);

		return await stripe.subscriptions.create({
			customer: customer.id,
			items: [
				{
					price_data: {
						currency: "usd",
						product: product.id,
						unit_amount: toStripeAmount(amount),
						recurring: {
							interval: "month"
						}
					}
				}
			],
			payment_behavior: "default_incomplete",
			payment_settings: { save_default_payment_method: "on_subscription" },
			expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
			metadata: {
				userId: user.id,
				email: user.email
			}
		});
	},
	async retrieveSubscription(subscriptionId: string) {
		return await stripe.subscriptions.retrieve(subscriptionId);
	},
	async cancelSubscription(subscriptionId: string) {
		return await stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: true
		});
	}
};

async function createCustomer(user: Pick<User, "email" | "id" | "nick">) {
	return await stripe.customers.create({
		email: user.email,
		name: user.nick,
		description: "Customer " + user.email,
		metadata: {
			userId: user.id,
			email: user.email
		}
	});
}

async function createProduct(user: Pick<User, "email" | "id" | "nick">, name: string) {
	return await stripe.products.create({
		name,
		metadata: {
			userId: user.id,
			email: user.email
		}
	});
}
