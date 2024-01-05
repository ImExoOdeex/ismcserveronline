import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";
import { requireSuperDuperToken } from "~/components/server/functions/env.server";

export async function action({ request }: ActionFunctionArgs) {
	if (request.headers.get("Authorization") !== requireSuperDuperToken()) {
		return json({ message: "Sorry, but you don't have access to use this endpoint ;d", success: false });
	}

	const body = JSON.parse(await request.text());

	await db.$transaction([db.server.deleteMany(), db.server.createMany({ data: body })]);

	return json({ success: true, message: "yes" });
}
