import { type LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/components/server/auth/authenticator.server";

// get to this route
export async function loader({ request }: LoaderArgs) {
	return await authenticator.authenticate(request, {
		successRedirect: "/dashboard",
		failureRedirect: "/login?message=fail"
	});
}

// post to this route
export { loader as action };
