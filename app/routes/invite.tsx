import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import links from "../components/config/links.json";

export async function loader(_: LoaderFunctionArgs) {
	return redirect(links.discordServerInvite);
}
