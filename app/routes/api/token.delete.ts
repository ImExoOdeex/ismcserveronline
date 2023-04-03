import { type ActionArgs, json } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";

export async function action({ request }: ActionArgs) {
	const body: any = JSON.parse(await request.text());
	if (!body.userId) {
		return json(
			{ message: "Missing userId in body!" },
			{
				headers: {
					"Content-type": "application/json"
				},
				status: 500
			}
		);
	}

	const headerToken = request.headers.get("Authorization");
	if (headerToken !== process.env.SUPER_DUPER_API_ACCESS_TOKEN) {
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

	const userExistsInDb = (await db.token.findUnique({
		where: {
			user_id: body.userId
		}
	}))
		? true
		: false;

	if (!userExistsInDb) {
		return json(
			{ message: "User does not exist in db!" },
			{
				// allowed status code d;
				status: 200
			}
		);
	}

	await db.token
		.delete({
			where: {
				user_id: body.userId
			}
		})
		.catch((err) => {
			return json(
				{
					message: `There was an error deleting the token: \`${err}\``
				},
				{
					headers: {
						"Content-type": "application/json"
					},
					status: 500
				}
			);
		});

	return json(
		{ message: "" },
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
