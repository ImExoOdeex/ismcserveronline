import { db } from "@/.server/db/db";
import { getUserId } from "@/.server/db/models/user";
import { getServerInfo } from "@/.server/functions/api.server";
import { csrf } from "@/.server/functions/security.server";
import { commitSession, getSession } from "@/.server/session";
import { MinecraftServerWoQuery } from "@/types/minecraftServer";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	const form = await request.formData();

	csrf(request);
	const userId = await getUserId(request);
	invariant(userId, "User not found");

	switch (form.get("action")?.toString()) {
		case "check": {
			try {
				const server = form.get("server")?.toString();
				invariant(server, "Server not found in form");

				const exisitngServer = await db.sampleServer
					.findFirst({
						where: {
							Server: {
								server
							}
						}
					})
					.catch(() => null);
				if (exisitngServer) throw new Error("Server already exists");

				const data: MinecraftServerWoQuery = await getServerInfo(server);

				invariant(data.online, "Server is offline");
				invariant(data.favicon, "Server has no favicon");

				return typedjson({
					success: true,
					data
				});
			} catch (e) {
				console.log(e);
				return typedjson(
					{ error: (e as Error).message, success: false },
					{
						status: 400
					}
				);
			}
		}
		case "add": {
			try {
				const daysForm = form.get("days")?.toString();
				invariant(daysForm, "Days not found in form");
				const days = parseInt(daysForm);
				if (isNaN(days)) throw new Error("Days is not a number");
				if (days < 30) throw new Error("Days is less than 30");
				if (days > 360) throw new Error("Days is more than 360");

				const session = await getSession(request.headers.get("Cookie"));
				invariant(session, "Session not found");

				const server = form.get("server")?.toString();
				invariant(server, "Server not found in form");

				session.set("days", days);
				session.set("server", server);

				return redirect("/dashboard/add-server/payment", {
					headers: {
						"Set-Cookie": await commitSession(session)
					}
				});
			} catch (e) {
				console.log(e);
				return typedjson(
					{ error: (e as Error).message, success: false },
					{
						status: 400
					}
				);
			}
		}
		default:
			throw new Error("Unknown action");
	}
}
