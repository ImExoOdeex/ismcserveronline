import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import stripe, { subscriptionHandlers } from "@/.server/modules/stripe";
import { getSession } from "@/.server/session";
import plans from "@/utils/plans";
import { ActionFunctionArgs, json } from "@remix-run/node";
import Stripe from "stripe";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);

	try {
		const user = await getUser(request);
		invariant(user, "Missing user");

		const session = await getSession(request.headers.get("Cookie"));
		const subType = session.get("subType") as "server" | "user";
		invariant(subType === "server" || subType === "user", "Invalid subType");

		const form = await request.formData();
		const serverId = Number(form.get("serverId")) as number | undefined;

		const plan = plans.find((p) => p.type === subType);
		invariant(plan, "Invalid plan");

		if (subType === "server") {
			invariant(serverId, "Invalid serverId");

			const server = await db.server.findUnique({
				where: {
					id: serverId
				}
			});

			invariant(server, "This server does not exist");
			invariant(server.owner_id === user.id, "You are not the owner of this server");
			invariant(!server.prime, "This server is already subscribed");
		}

		const subscription = await subscriptionHandlers.createSubscription(user, plan.price, serverId);

		const paymentIntent = (subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent | null;

		if (paymentIntent) {
			await stripe.paymentIntents.update(paymentIntent.id, {
				metadata: {
					type: "subscription",
					userId: user.id,
					email: user.email,
					subscription: "prime",
					subType: serverId ? "server" : "user",
					serverId: serverId ? serverId : null
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
