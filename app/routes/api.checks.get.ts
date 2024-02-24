import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";
import { csrf } from "~/components/server/functions/security.server";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);
	const form = await request.formData();

	const serverId = form.get("serverId") as string;
	if (!serverId) throw new Error("No server provided");
	const c = form.get("c") as string;

	const checks = await db.check.findMany({
		where: {
			server_id: Number(serverId)
		},
		select: {
			id: true,
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
