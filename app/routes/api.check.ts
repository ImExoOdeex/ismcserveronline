import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/components/server/db/db.server";
import { requireEnv } from "~/components/server/functions/env.server";

// This is typically POST request to this route. I use it for adding discord server checks. You can't make this request, cuz you dont have super duper 2048 bit access token hah
export async function action({ request }: ActionFunctionArgs) {
	const body: any = JSON.parse(await request.text());

	const headerToken = request.headers.get("Authorization");

	if (headerToken !== requireEnv("SUPER_DUPER_API_ACCESS_TOKEN"))
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
							token: requireEnv("API_TOKEN")
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
	if (!token_id) {
		return json({
			success: false,
			error: "Token not found"
		});
	}

	const serverId = (
		await db.server.findFirst({
			where: {
				server: body.server
			},
			select: {
				id: true
			}
		})
	)?.id;
	if (!serverId) {
		return json({
			success: false,
			error: "Server not found"
		});
	}

	await db.check.create({
		data: {
			server_id: serverId,
			online: body.online,
			players: body.players,
			source: body.source ?? "WEB",
			token_id: token_id,
			client_ip: IP
		}
	});

	return json({
		success: true
	});
}

// return 404, since without it, it will throw error
export async function loader() {
	throw new Response("Not found", {
		status: 404
	});
}
