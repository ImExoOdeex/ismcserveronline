import type { DiscordUser } from "@/.server/auth/authenticator";
import { db } from "@/.server/db/db";
import { requireEnv } from "@/.server/functions/env.server";
import serverConfig from "@/.server/serverConfig";
import { DiscordStrategy } from "remix-auth-discord";
import type { Guild } from "~/routes/dashboard._index";
import { Info, sendLoginWebhook } from "./webhooks";

async function checkImageExists(imageUrl: string): Promise<boolean> {
    try {
        const _start = Date.now();
        const response = await fetch(imageUrl, {
            method: "head"
        });

        return response.ok;
    } catch (_error) {
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

export const discordStrategy = new DiscordStrategy<DiscordUser>(
    {
        clientID: requireEnv("DISCORD_CLIENT_ID"),
        clientSecret: requireEnv("DISCORD_CLIENT_SECRET"),
        scope: ["identify", "email", "guilds"],
        prompt: "none",
        callbackURL: `${serverConfig.redirectUrl}/api/auth/discord/callback`
    },
    async ({ profile, accessToken, context }) => {
        if (!profile?.emails?.length) {
            throw new Error("You need an email on your Discord account to login!");
        }

        const email = profile.emails[0].value;

        const _start = Date.now();
        const [guilds, photo] = await Promise.all([
            fetch("https://discord.com/api/users/@me/guilds", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                        throw new Error("Failed to fetch guilds");
                })
                .then((res) => {
                    return res
                        .filter((guild: Guild) => (guild.permissions & 0x20) === 0x20)
                        .sort((a: Guild, b: Guild) => {
                            if (a.owner === true && b.owner !== true) {
                                return -1;
                            }if (b.owner === true && a.owner !== true) {
                                return 1;
                            }
                                return 0;
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
                nick: getFullUsername(
                    profile.__json.global_name || profile.__json.username,
                    profile.__json.discriminator
                ),
                snowflake: profile.id,
                guilds: guilds as any,
                photo
            },
            update: {
                nick: getFullUsername(
                    profile.__json.global_name || profile.__json.username,
                    profile.__json.discriminator
                ),
                snowflake: profile.id,
                guilds: guilds as any,
                photo
            }
        });

        sendLoginWebhook(user, "discord", new Info(context as unknown as Headers));

        return {
            email,
            snowflake: profile.id,
            id: user.id
        };
    }
);
