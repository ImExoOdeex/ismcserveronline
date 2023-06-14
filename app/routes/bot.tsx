import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import links from "../components/config/links.json";

export async function loader(_: LoaderArgs) {
	return redirect(links.discordBotInvite);
}
