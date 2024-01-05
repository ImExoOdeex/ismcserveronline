import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";
import { requireDomain } from "~/components/server/functions/security.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	requireDomain(request);

	const server = url.searchParams.get("server");
	if (!server) throw new Error("No server provided");
	const c = url.searchParams.get("c") || 0;

	const checks = await db.check.findMany({
		where: {
			server: {
				contains: server
			},
			bedrock: false
		},
		select: {
			id: true,
			server: false,
			online: true,
			players: true,
			source: true,
			checked_at: true
		},
		orderBy: {
			id: "desc"
		},
		take: 20,
		skip: Number(c) ?? 0
	});

	return json({ checks });
}
