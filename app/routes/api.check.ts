import type { ActionFunctionArgs } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/components/server/db/db.server";

// This is typically POST request to this route. I use it for adding discord server checks. You can't make this request, cuz you dont have super duper 2048 bit access token hah
export async function action({ request }: ActionFunctionArgs) {
	const body: any = JSON.parse(await request.text());

	const headerToken = request.headers.get("Authorization");

	if (!headerToken)
		return new Response("Super Duper Token does not match the real 2048 bit Super Duper Token!", {
			status: 405
		});

	const IP =
		body.source === "DISCORD" || body.source === "API" ? (body?.IP ? body.IP : null) : getClientIPAddress(request.headers);

	const token_id =
		body.source !== "API"
			? (
					await db.token.findUnique({
						where: {
							token: process.env.API_TOKEN
						}
					})
			  )?.id
			: (
					await db.token.findUnique({
						where: {
							token: body.token
						},
						select: {
							id: true
						}
					})
			  )?.id;

	await db.check.create({
		data: {
			server: body.server,
			online: body.online,
			players: body.players,
			bedrock: body.bedrock ?? false,
			source: body.source ?? "WEB",
			token_id: token_id,
			client_ip: IP
		}
	});

	return new Response(null, {
		status: 200
	});
}

// return 404, since without it, it will throw error
export async function loader() {
	throw new Response("Not found", {
		status: 404
	});
}
