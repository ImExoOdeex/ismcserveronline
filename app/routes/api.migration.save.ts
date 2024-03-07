import { db } from "@/.server/db/db";
import { secureBotRoute } from "@/.server/functions/env.server";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import * as fs from "node:fs/promises";

export async function action({ request }: ActionFunctionArgs) {
	secureBotRoute(request);

	async function saveDatabase() {
		// write a script that will migrate the database to the new schema. new schema will have new Model named Server and it will be related to other models like Check, Comment, SavedServer etc
		// the script will be run once and will be deleted after running

		// get the whole database in json format
		const [user, savedServer, sampleServer, comment, check, token] = await Promise.all([
			db.user.findMany(),
			db.savedServer.findMany(),
			db.sampleServer.findMany(),
			db.comment.findMany(),
			db.check.findMany(),
			db.token.findMany()
		]);

		const wholeDatabase = {
			user,
			savedServer,
			sampleServer,
			comment,
			check,
			token
		};

		const now = new Date()
			.toLocaleString()
			.replaceAll("/", "-")
			.replaceAll(":", "-")
			.replaceAll(" ", "-")
			.replaceAll(",", "");

		await fs.writeFile(`migration/migration.json`, JSON.stringify(wholeDatabase, null, 2)).then(() => {
			console.log("migration.json has been created");
		});
	}

	await saveDatabase();

	return json({
		success: true
	});
}
