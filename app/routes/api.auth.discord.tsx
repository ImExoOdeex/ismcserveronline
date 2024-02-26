import { authenticator } from "@/.server/auth/authenticator";
import type { LoaderFunctionArgs } from "@remix-run/node";

// get to this route
export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticator.authenticate(request, {
		successRedirect: "/dashboard",
		failureRedirect: "/login?message=fail"
	});
}

// post to this route
export { loader as action };
