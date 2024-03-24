import { authenticator } from "@/.server/auth/authenticator";
import { getSession } from "@/.server/session";
import type { LoaderFunctionArgs } from "@remix-run/node";

// get to this route
export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const redirect = session.get("redirect") ?? "/dashboard";

	return await authenticator.authenticate(request, {
		successRedirect: redirect,
		throwOnError: true
	});
}
