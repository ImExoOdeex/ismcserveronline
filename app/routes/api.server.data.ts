import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/components/server/db/db.server";
import { requireAPIToken } from "~/components/server/functions/env.server";
import { requireDomain } from "~/components/server/functions/security.server";
import { MinecraftServerWoQuery } from "~/components/types/minecraftServer";
import { getCookieWithoutDocument } from "~/components/utils/functions/cookies";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	requireDomain(request);

	const server = url.searchParams.get("server");
	if (!server) {
		return "no server given!";
	}

	const data: MinecraftServerWoQuery = await fetch(`https://api.ismcserver.online/${server}`, {
		method: "get",
		headers: [["Authorization", requireAPIToken()]]
	}).then((res) => res.json());

	const cookie = getCookieWithoutDocument("tracking", request.headers.get("cookie") ?? "");
	const blockTracking = cookie == "no-track" ? true : false;

	if (!blockTracking && data) {
		const IP = getClientIPAddress(request.headers);

		await db.check.create({
			data: {
				server: server,
				online: data.online,
				players: data.players.online,
				bedrock: false,
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
