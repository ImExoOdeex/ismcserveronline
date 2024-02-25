import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "remix-typedjson";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const newUrl = url.toString().replace("verify", "vote") + "?verify";

	return redirect(newUrl);
}
