import { requireEnv } from "@/.server/functions/env.server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	invariant(process.env.NODE_ENV === "development");

	const auth = request.headers.get("Authorization");
	if (auth !== requireEnv("TESTING_KEY")) {
		throw new Response("Unauthorized", { status: 401 });
	}

	const body = await request.json();
	console.log("body", body);

	return typedjson({
		...body
	});
}
