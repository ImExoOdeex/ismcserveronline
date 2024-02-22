import { type Guild } from "~/routes/dashboard._index";
import { getUser } from "../db/models/user";

export async function requireUserGuild(request: Request, guildID: string, guildsArg?: Guild[]) {
	const guilds =
		guildsArg ||
		((
			await getUser(request, {
				guilds: true
			})
		)?.guilds as unknown as Guild[]);
	if (!guilds) {
		throw new Error("User has no guilds.");
	}

	if (!guilds) {
		throw new Error("User is not logged or has no guilds.");
	}

	const guild = guilds.find((guild) => guild.id === guildID);

	if (!guild) {
		throw new Error("User is not in this guild. Action forbidden.");
	}

	if ((guild.permissions & 0x20) !== 0x20) {
		throw new Error("User does not have admin permissions in this guild. Action forbidden.");
	}
}
