import { authenticator } from "@/.server/auth/authenticator";
import { getUserId } from "@/.server/db/models/user";
import { commitSession, getSession } from "@/.server/session";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
	const url = new URL(request.url);
	const redirectParam = url.searchParams.get("redirect");

	if (redirectParam) {
		const userId = await getUserId(request);
		const session = await getSession(request.headers.get("Cookie"));
		session.set("redirect", redirectParam);

		throw redirect(userId ? redirectParam : "", {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	return await authenticator.authenticate(request, {
		successRedirect: "/dashboard"
	});
}
