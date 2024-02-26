import { commitSession, getSession } from "@/.server/session";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "remix-typedjson";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const cookies = request.headers.get("Cookie");
	const session = await getSession(cookies);

	const redirectURLParam = url.searchParams.get("redirect") as string;
	const guildIDParam = url.searchParams.get("guild") as string;

	session.set("redirect", redirectURLParam);
	session.set("guild", guildIDParam);

	return redirect("/login?redirect", {
		headers: {
			"Set-Cookie": await commitSession(session)
		}
	});
}
