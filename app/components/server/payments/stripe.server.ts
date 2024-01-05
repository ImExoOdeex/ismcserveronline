import { json } from "@remix-run/node";
import dayjs from "dayjs";
import Stripe from "stripe";
import invariant from "tiny-invariant";
import { PaymentIntentMetadata } from "~/components/types/typings";
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

		return json(null, { status: 200 });
	},
	async handlePaymentIntentCancelled(event: Stripe.Event) {
		const paymentIntent = event.data.object as Stripe.PaymentIntent;
		const { sampleServerId } = paymentIntent.metadata as unknown as PaymentIntentMetadata;
		invariant(sampleServerId, "Missing sample server id");

		await db.sampleServer.update({
			where: {
				id: Number(sampleServerId)
			},
			data: {
				payment_status: "CANCELLED"
			}
		});

		return json(null, { status: 200 });
	}
};

export function toStripeAmount(amount: number) {
	return Math.floor(amount * 100);
}
