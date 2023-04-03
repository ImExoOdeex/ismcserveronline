import { type LoaderFunction, type ActionArgs } from "@remix-run/node";
import { authenticator } from "~/components/server/auth/auth.server";

export const loader: LoaderFunction = async ({ request }: ActionArgs) => {
	return await authenticator.authenticate("discord", request, {
		successRedirect: "/dashboard",
		failureRedirect: "/login?message=fail"
	});
};
