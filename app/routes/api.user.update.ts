import { db } from "@/.server/db/db";
import { secureBotRoute } from "@/.server/functions/env.server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

// used by bot to update user, when changed username or avatar
export async function action({ request }: ActionFunctionArgs) {
	secureBotRoute(request);

	const form = await request.formData();
	const userId = form.get("userId") as string;
	const username = form.get("username") as string;
	const avatar = form.get("avatar") as string;

	invariant(userId, "userId is required");
	invariant(username, "username is required");
	invariant(avatar, "avatar is required");

	// update user
	await db.user
		.update({
			where: {
				snowflake: userId
			},
			data: {
				nick: username,
				photo: avatar
			}
		})
		.catch((e) => {
			console.error("error updating user. probably they aren't in database", e);
		});

	return typedjson({
		success: true
	});
}
