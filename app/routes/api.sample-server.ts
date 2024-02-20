import { json, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { db } from "~/components/server/db/db.server";
import { getUser } from "~/components/server/db/models/user";
import { getServerInfo } from "~/components/server/functions/api.server";
import { csrf } from "~/components/server/functions/security.server";
import stripe from "~/components/server/payments/stripe.server";

export async function action({ request }: ActionFunctionArgs) {
	try {
		const form = await request.formData();
		const method = request.method;

		csrf(request);

		switch (method) {
			case "POST": {
				let serverId: string | number | undefined = form.get("server")?.toString();
				const paymentIntentId = form.get("paymentIntentId")?.toString();
				invariant(serverId, "Missing server");
				serverId = parseInt(serverId as string);
				invariant(paymentIntentId, "Missing payment intent id");
				const user = await getUser(request);
				invariant(user, "Missing user");

				const exisitngServer = await db.sampleServer
					.findFirst({
						where: {
							server_id: serverId
						}
					})
					.catch(() => null);
				if (exisitngServer) throw new Error("Server already exists");

				const server = await db.server.findUnique({
					where: {
						id: serverId
					}
				});
				invariant(server, "Server not found");

				const res = await getServerInfo(server.server);
				if (!res?.favicon) throw new Error("Server has no favicon");

				const createdSampleServer = await db.sampleServer.create({
					data: {
						server_id: serverId,
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
