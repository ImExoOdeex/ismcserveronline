import { ActionFunctionArgs, json } from "@remix-run/node";
import Stripe from "stripe";
import invariant from "tiny-invariant";
import config from "~/components/config/config";
import { getUser } from "~/components/server/db/models/user";
import { csrf } from "~/components/server/functions/security.server";
import stripe, { subscriptionHandlers } from "~/components/server/payments/stripe.server";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);

	try {
		const user = await getUser(request);
		invariant(user, "Missing user");

		const subscription = await subscriptionHandlers.createSubscription(user, config.primePrice);

		const paymentIntent = (subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent | null;

		if (paymentIntent) {
			await stripe.paymentIntents.update(paymentIntent.id, {
				metadata: {
					type: "subscription",
					userId: user.id,
					email: user.email,
					subscription: "prime"
				}
			});
		}

		if (subscription.pending_setup_intent !== null) {
			console.log("if if if if if");
			return json({
				type: "setup",
				clientSecret: (subscription.pending_setup_intent as Stripe.SetupIntent).client_secret,
				paymentIntentId: paymentIntent!.id
			});
		} else {
			console.log("else else else else else");
			return json({
				type: "payment",
				clientSecret: paymentIntent!.client_secret,
				paymentIntentId: paymentIntent!.id
			});
		}
	} catch (error: any) {
		console.error(error);
		return json({ error: error.message }, { status: 500 });
	}
}
