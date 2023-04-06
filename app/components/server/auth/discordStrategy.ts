import { DiscordStrategy } from "remix-auth-discord";
import { db } from "~/components/server/db/db.server";
import { type Guild } from "~/routes/dashboard/index";

if (!process.env.DISCORD_CLIENT_ID) throw new Error("process.env.DISCORD_CLIENT_ID is not defined!");
if (!process.env.DISCORD_CLIENT_SECRET) throw new Error("process.env.DISCORD_CLIENT_SECRET is not defined!");

export const discordStrategy: any = new DiscordStrategy(
	{
		clientID: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		scope: ["identify", "email"],
		callbackURL:
			process.env.NODE_ENV === "production"
				? `https://ismcserver.online/api/auth/discord/callback`
				: `http://localhost:3000/api/auth/discord/callback`
	},
	async ({ profile, accessToken }) => {
		if (!profile?.emails?.length) {
			return null;
		}

		const email: string = profile.emails[0].value;

		const guilds: Guild[] = await (
			await fetch(`https://discord.com/api/users/@me/guilds`, {
				method: "get",
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})
		).json();

		await db.user.upsert({
			where: {
				email
			},
			create: {
				email: email,
				nick: profile.displayName,
				snowflake: profile.id,
				guilds: guilds,
				photo: profile?.photos?.length
					? `https://cdn.discordapp.com/avatars/${profile.id}/${profile?.photos[0].value}.webp`
					: null
			},
			update: {
				nick: profile.displayName,
				snowflake: profile.id,
				guilds: guilds,
				photo: profile?.photos?.length
					? `https://cdn.discordapp.com/avatars/${profile.id}/${profile?.photos[0].value}.webp`
					: null
			}
		});

		return {
			email,
			snowflake: profile.id
		};
	}
);
