import { authenticator } from "@/.server/auth/authenticator";
import { getSession } from "@/.server/session";
import type { LoaderFunctionArgs } from "@remix-run/node";

// get to this route
export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const redirectURL = session.get("redirect");
	const guildID = session.get("guild");

	return await authenticator.authenticate(request, {
		successRedirect: `/dashboard?guild=${guildID}&redirect=${redirectURL}`,
		failureRedirect: "/login?message=fail"
	});
}

// post to this route
export { loader as action } from "./api.auth.discord";
