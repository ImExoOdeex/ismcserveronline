import { json, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { db } from "~/components/server/db/db.server";
import { getUser } from "~/components/server/db/models/user";
import { requireAPIToken } from "~/components/server/functions/env.server";
import { requireDomain } from "~/components/server/functions/security.server";
import stripe from "~/components/server/payments/stripe.server";
import serverConfig from "~/components/server/serverConfig.server";

export async function action({ request }: ActionFunctionArgs) {
	try {
		const form = await request.formData();
		const method = request.method;

		requireDomain(request);

		switch (method) {
			case "POST": {
				const server = form.get("server")?.toString();
				const paymentIntentId = form.get("paymentIntentId")?.toString();
				invariant(server, "Missing server");
				invariant(paymentIntentId, "Missing payment intent id");
				const user = await getUser(request);
				invariant(user, "Missing user");

				const exisitngServer = await db.sampleServer
					.findFirst({
						where: {
							server
						}
					})
					.catch(() => null);
				if (exisitngServer) throw new Error("Server already exists");

				const res = await fetch(`${serverConfig.api}/${server}`, {
					headers: {
						Authorization: requireAPIToken()
					}
				}).then((res) => res.json());

				if (!res?.favicon) throw new Error("Invalid server");

				const createdSampleServer = await db.sampleServer.create({
					data: {
						server,
						favicon: res.favicon,
						user_id: user.id
					}
				});

				await stripe.paymentIntents.update(paymentIntentId, {
					metadata: {
						sampleServerId: createdSampleServer.id,
						email: user.email,
						type: "sampleServer"
					}
				});

				return json({
					success: true,
					data: createdSampleServer
				});
			}
			default:
				throw new Error("Method not allowed");
		}
	} catch (e) {
		console.error(e);
		return json({
			success: false,
			error: (e as Error).message
		});
	}
}
