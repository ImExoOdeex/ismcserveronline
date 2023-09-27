import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/components/server/auth/authenticator.server";

export async function loader({ request }: LoaderArgs) {
	return await authenticator.logout(request, {
		redirectTo: "/login?redirect",
		doNotLog: true
	});
}
