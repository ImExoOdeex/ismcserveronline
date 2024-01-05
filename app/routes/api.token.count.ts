import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";
import { requireSuperDuperToken } from "~/components/server/functions/env.server";

export async function action({ request }: ActionFunctionArgs) {
	const body: any = JSON.parse(await request.text());

	const headerToken = request.headers.get("Authorization");
	if (headerToken !== requireSuperDuperToken()) {
		return json(
			{
				message: "Super Duper Token does not match the real 2048 bit Super Duper Token!"
			},
			{
				// not allowed status code
				status: 405
			}
		);
	}

	if (!body.token) {
		return json(
			{ message: "Please add token to body!" },
			{
				headers: {
					"Content-type": "application/json"
				},
				status: 200
			}
		);
	}

	const valid = (await db.token.findUnique({
		where: {
			token: body.token
		}
	}))
		? true
		: false;

	const count = await db.check
		.count({
			where: {
				Token: {
					token: body.token
				}
			}
		})
		.catch(() => null);

	return json(
		{ count, valid },
		{
			headers: {
				"Content-type": "application/json"
			},
			status: 200
		}
	);
}

// return 404, since without it, it will throw error
export async function loader() {
	throw new Response("Not found", {
		status: 404
	});
}
