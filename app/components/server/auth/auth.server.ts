import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { sessionStorage } from "../session.server";
import { db } from "~/components/server/db/db.server";
import { type User } from "@prisma/client";

export const authenticator = new Authenticator<User>(sessionStorage, {
	throwOnError: true
});

if (!process.env.DISCORD_CLIENT_ID) throw new Error("process.env.DISCORD_CLIENT_ID is not defined!");
if (!process.env.DISCORD_CLIENT_SECRET) throw new Error("process.env.DISCORD_CLIENT_SECRET is not defined!");

const discordStrategy: any = new DiscordStrategy(
	{
		clientID: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		scope: ["guilds", "identify", "email"],
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

		const user = await db.user.findUnique({
			where: {
				email
			}
		});

		if (user) {
			return await db.user.update({
				where: {
					email
				},
				data: {
					nick: profile.displayName,
					snowflake: profile.id,
					access_token: accessToken,
					photo: profile?.photos?.length
						? `https://cdn.discordapp.com/avatars/${profile.id}/${profile?.photos[0].value}.webp`
						: null
				}
			});
		}

		return await db.user.create({
			data: {
				email: email,
				nick: profile.displayName,
				snowflake: profile.id,
				access_token: accessToken,
				photo: profile?.photos?.length
					? `https://cdn.discordapp.com/avatars/${profile.id}/${profile?.photos[0].value}.webp`
					: null
			}
		});
	}
);

authenticator.use(discordStrategy, "discord");
