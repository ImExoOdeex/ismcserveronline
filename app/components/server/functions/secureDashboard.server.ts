import { type Guild } from "~/routes/dashboard._index";
import { getUserGuilds } from "../db/models/user";

export async function requireUserGuild(request: Request, guildID: string) {
	const guilds = (await getUserGuilds(request)) as Guild[];

	if (!guilds) {
		throw new Error("User is not logged or has no guilds.");
	}

	if (!guilds.find((guild) => guild.id === guildID)) {
		throw new Error("User is not in this guild. Action forbidden.");
	}
}
