import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/components/server/db/db.server";
import { getCookieWithoutDocument } from "~/components/utils/functions/cookies";

export async function loader({ request }: LoaderFunctionArgs) {
	if (!process.env.API_TOKEN) throw new Error("API_TOKEN is not definied!");

	const url = new URL(request.url);

	if (process.env.NODE_ENV === "production" && url.hostname !== "ismcserver.online") {
		return json(
			{ message: "Not allowed :). Use our FREE API for that! Thanks!" },
			{
				status: 405
			}
		);
	}

	const server = url.searchParams.get("server");
	if (!server) {
		return "no server given!";
	}

	const data: any = await (
		await fetch(`https://api.ismcserver.online/${server}`, {
			method: "get",
			headers: [["Authorization", process.env.API_TOKEN]]
		})
	).json();

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
