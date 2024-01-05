import { ActionFunctionArgs } from "@remix-run/node";
import { requireEnv } from "~/components/server/functions/env.server";
import stripe, { webhookHandlers } from "~/components/server/payments/stripe.server";

export async function action({ request }: ActionFunctionArgs) {
	const sig = request.headers.get("stripe-signature");
	const payload = await request.text();
	const event = stripe.webhooks.constructEvent(payload, sig ?? "", requireEnv("STRIPE_WEBHOOK"));

	console.log(`Received event ${event.type}`);
	switch (event.type) {
		// Payment Intent Cancelled
		case "payment_intent.canceled":
			return await webhookHandlers.handlePaymentIntentCancelled(event);
		// Payment Intent Failed
		case "payment_intent.payment_failed":
			return await webhookHandlers.handlePaymentIntentFailed(event);
		// Payment Intent Processing
		case "payment_intent.processing":
			return await webhookHandlers.handlePaymentIntentProcessing(event);
		// Payment Intent Succeeded
		case "payment_intent.succeeded":
			return await webhookHandlers.handlePaymentIntentSucceeded(event);
	}

	console.warn(`Unhandled event type ${event.type}`);
	return new Response(`Unhandled event type ${event.type}`, { status: 400 });
}

export async function loader() {
	return new Response("", { status: 404 });
}
