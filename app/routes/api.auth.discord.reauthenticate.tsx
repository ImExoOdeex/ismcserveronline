import { authenticator } from "@/.server/auth/authenticator";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticator.logout(request, {
		redirectTo: "/api/auth/discord"
	});
}
