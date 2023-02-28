import { type ActionArgs, json } from "@remix-run/node";
import { db } from "~/components/utils/db.server";

export async function action({ request }: ActionArgs) {
	if (request.headers.get("Authorization") !== process.env.SUPER_DUPER_API_ACCESS_TOKEN) {
		return json({ message: "Sorry, but you don't have access to use this endpoint ;d" });
	}

	const body = JSON.parse(await request.text());

	await db.$transaction([db.server.deleteMany(), db.server.createMany({ data: body })]);

	return json({ message: "Success" });
}
