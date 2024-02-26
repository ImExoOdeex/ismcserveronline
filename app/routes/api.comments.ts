import { db } from "@/.server/db/db";
import { csrf } from "@/.server/functions/security.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);
	const form = await request.formData();

	const serverId = form.get("serverId") as string;
	invariant(serverId, "serverId not found in form");

	const comments = await db.comment.findMany({
		where: {
			server_id: parseInt(serverId)
		},
		select: {
			id: true,
			content: true,
			created_at: true,
			updated_at: true,
			user: {
				select: {
					nick: true,
					photo: true,
					id: true
				}
			}
		},
		orderBy: {
			created_at: "desc"
		}
	});

	return typedjson({
		comments
	});
}
