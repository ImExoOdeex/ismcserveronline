import { authenticator } from "@/.server/auth/authenticator";
import { commitSession, getSession } from "@/.server/session";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "remix-typedjson";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const redirectPath = session.get("redirect") ?? "/dashboard";

    return await authenticator
        .authenticate(request, {
            successRedirect: redirectPath,
            throwOnError: true
        })
        .catch(async (e: Error) => {
            if (e instanceof Response) throw e;

            console.log("login error", e);

            session.set("login-error", e.message);

            throw redirect("/login-error", {
                headers: {
                    "Set-Cookie": await commitSession(session)
                }
            });
        });
}
