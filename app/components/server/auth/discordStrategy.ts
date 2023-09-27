import { DiscordStrategy } from "remix-auth-discord";
import { db } from "~/components/server/db/db.server";
import { type Guild } from "~/routes/dashboard._index";
import { Info, sendLoginWebhook } from "./webhooks";

if (!process.env.DISCORD_CLIENT_ID) throw new Error("process.env.DISCORD_CLIENT_ID is not defined!");
if (!process.env.DISCORD_CLIENT_SECRET) throw new Error("process.env.DISCORD_CLIENT_SECRET is not defined!");

async function checkImageExists(imageUrl: string): Promise<boolean> {
	try {
		const response = await fetch(imageUrl, {
			method: "head"
		});
		return response.ok;
	} catch (error) {
		return false;
	}
}

async function getPhotoURL(id: string, photo: string | null): Promise<string | null> {
	return photo
		? (await checkImageExists(`https://cdn.discordapp.com/avatars/${id}/${photo}.gif`))
			? `https://cdn.discordapp.com/avatars/${id}/${photo}.gif`
			: `https://cdn.discordapp.com/avatars/${id}/${photo}.webp`
		: null;
}

function getFullUsername(name: string, discriminator: string) {
	if (Number(discriminator)) return name + "#" + discriminator;
	return name;
}

export const discordStrategy: any = new DiscordStrategy(
	{
		clientID: process.env.NODE_ENV === "production" ? process.env.DISCORD_CLIENT_ID : process.env.DISCORD_CLIENT_ID_DEV ?? "",
		clientSecret:
			process.env.NODE_ENV === "production"
				? process.env.DISCORD_CLIENT_SECRET
				: process.env.DISCORD_CLIENT_SECRET_DEV ?? "",
		scope: ["identify", "email", "guilds"],
		prompt: "none",
		callbackURL:
			process.env.NODE_ENV === "production"
				? `https://ismcserver.online/api/auth/discord/callback`
				: `http://localhost:3000/api/auth/discord/callback`
	},
	async ({ profile, accessToken, context }) => {
		if (!profile?.emails?.length) {
			throw new Error("You need an email on your Discord account to login!");
		}

		const email: string = profile.emails[0].value;

		const guilds: Guild[] = (
			await (
				await fetch(`https://discord.com/api/users/@me/guilds`, {
					method: "get",
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				})
			).json()
		)
			.filter((guild: Guild) => (guild.permissions & 0x20) == 0x20)
			.sort((a: Guild, b: Guild) => {
				if (a.owner === true && b.owner !== true) {
					return -1;
				} else if (b.owner === true && a.owner !== true) {
					return 1;
				} else {
					return 0;
				}
			});

		const user = await db.user.upsert({
			where: {
				email
			},
			create: {
				email: email,
				nick: getFullUsername(profile.__json.username, profile.__json.discriminator),
				snowflake: profile.id,
				guilds: guilds,
				photo: await getPhotoURL(profile.__json.id, profile.__json.avatar)
			},
			update: {
				nick: getFullUsername(profile.__json.username, profile.__json.discriminator),
				snowflake: profile.id,
				guilds: guilds,
				photo: await getPhotoURL(profile.__json.id, profile.__json.avatar)
			}
		});

		sendLoginWebhook(user, "discord", new Info((context as any as Request).headers));

		return {
			email,
			snowflake: profile.id,
			id: user.id
		};
	}
);
