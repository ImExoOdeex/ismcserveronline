import { json, type LoaderArgs } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils";
import { db } from "~/components/utils/db.server";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";

export async function loader({ request }: LoaderArgs) {
	if (!process.env.API_TOKEN) throw new Error("API_TOKEN is not definied!");

	const url = new URL(request.url);
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
