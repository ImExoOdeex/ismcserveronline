import { db } from "@/.server/db/db";
import serverConfig from "@/.server/serverConfig";
import { DiscordStrategy } from "remix-auth-discord";
import { type Guild } from "~/routes/dashboard._index";
import { Info, sendLoginWebhook } from "./webhooks";

if (!process.env.DISCORD_CLIENT_ID) throw new Error("process.env.DISCORD_CLIENT_ID is not defined!");
if (!process.env.DISCORD_CLIENT_SECRET) throw new Error("process.env.DISCORD_CLIENT_SECRET is not defined!");

async function checkImageExists(imageUrl: string): Promise<boolean> {
	try {
		const start = Date.now();
		const response = await fetch(imageUrl, {
			method: "head"
		});
		console.log("Checked image in", Date.now() - start, "ms");

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
		callbackURL: `${serverConfig.redirectUrl}/api/auth/discord/callback`
	},
	async ({ profile, accessToken, context }) => {
		if (!profile?.emails?.length) {
			throw new Error("You need an email on your Discord account to login!");
		}

		const email: string = profile.emails[0].value;

		const start = Date.now();
		const [guilds, photo] = await Promise.all([
			fetch(`https://discord.com/api/users/@me/guilds`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})
				.then((res) => {
					if (res.ok) {
						console.log("Fetched guilds in", Date.now() - start, "ms");
						return res.json();
					} else {
						throw new Error("Failed to fetch guilds");
					}
				})
				.then((res) => {
					return res
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
				}),
			getPhotoURL(profile.__json.id, profile.__json.avatar)
		]);

		const user = await db.user.upsert({
			where: {
				email
			},
			create: {
				email: email,
				nick: getFullUsername(profile.__json.username, profile.__json.discriminator),
				snowflake: profile.id,
				guilds: guilds as any,
				photo
			},
			update: {
				nick: getFullUsername(profile.__json.username, profile.__json.discriminator),
				snowflake: profile.id,
				guilds: guilds as any,
				photo
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
