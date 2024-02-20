import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/components/server/db/db.server";
import { getServerInfo } from "~/components/server/functions/api.server";
import { csrf } from "~/components/server/functions/security.server";
import { getCookieWithoutDocument } from "~/components/utils/functions/cookies";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	csrf(request);

	const server = url.searchParams.get("server");
	if (!server) {
		return "no server given!";
	}

	const data = await getServerInfo(server);
	const cookie = getCookieWithoutDocument("tracking", request.headers.get("cookie") ?? "");
	const blockTracking = cookie == "no-track" ? true : false;

	if (!blockTracking && data) {
		const IP = getClientIPAddress(request.headers);

		const serverId = (
			await db.server.findFirst({
				where: {
					server: server,
					bedrock: false
				},
				select: {
					id: true
				}
			})
		)?.id;
		if (!serverId) {
			throw new Error("Server not found");
		}

		await db.check.create({
			data: {
				server_id: serverId,
				online: data.online,
				players: data.players.online,
				source: "WEB",
				client_ip: IP,
				token_id: 1
			}
		});
	}

	return json(
		{ data, server },
		{
			status: 200
		}
	);
}
