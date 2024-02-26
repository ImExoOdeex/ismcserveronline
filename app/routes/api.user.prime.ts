import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);
	const user = await getUser(request);
	invariant(user, "User not found");

	const prime = !!user?.prime;

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
