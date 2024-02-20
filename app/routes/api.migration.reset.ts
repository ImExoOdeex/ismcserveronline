import { json, type ActionFunctionArgs } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";

export async function action({ request }: ActionFunctionArgs) {
	await db.comment.deleteMany();
	await db.sampleServer.deleteMany();
	await db.savedServer.deleteMany();
	await db.check.deleteMany();
	await db.server.deleteMany();
	await db.token.deleteMany();
	await db.user.deleteMany();

	return json({});
}
