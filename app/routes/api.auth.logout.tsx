import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/components/server/auth/authenticator.server";

export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticator.logout(request, {
		redirectTo: "/"
	});
}
export { loader as action };