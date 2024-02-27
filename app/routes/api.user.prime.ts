import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	const user = await getUser(request, {
		id: true,
		prime: true
	});
	invariant(user, "User not found");

	const hasAnyServerWithPrime = !!(await db.server.findFirst({
		where: {
			owner_id: user.id,
			prime: true
		}
	}));

	const prime = user.prime || hasAnyServerWithPrime;

	return json({
		prime,
		userId: user.id
	});
}

export async function loader(_: LoaderFunctionArgs) {
	return json("Method not allowed", {
		status: 405,
		headers: {
			Allow: "POST"
		}
	});
}
