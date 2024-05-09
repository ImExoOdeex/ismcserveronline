import { json } from "@remix-run/node";

const envs = [
    "DATABASE_URL",
    "REDIS_HOST",
    "REDIS_PASSWORD",
    "REDIS_DB",
    "API_TOKEN",
    "SUPER_DUPER_API_ACCESS_TOKEN",
    "NO_ADS_PARAM_NAME",
    "NO_ADS_PARAM_VALUE",
    "SESSION_SECRET",
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_CLIENT_ID_DEV",
    "DISCORD_CLIENT_SECRET_DEV",
    "DISCORD_WEBHOOK_LOGIN",
    "DISCORD_WEBHOOK_REPORT",
    "DASH_URL",
    "REDIRECT_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLIC_KEY",
    "STRIPE_WEBHOOK",
    "R2_URL",
    "R2_KEY_ID",
    "R2_KEY_SECRET",
    "UPLOADS_URL",
    "ENCRYPTION_KEY",
    "TESTING_KEY",
    "WS_URL",
    "API_URL",
    "BOT_API",
    // opitional
    "DISABLE_REDIS_CACHE",
    "REDIS_CACHE_LOGGING"
] as const;

type Env = (typeof envs)[number];

export function requireEnv(key: Env) {
    const value = process.env[key];
    if (typeof value !== "string") {
        throw new Error(`${key} is not set.`);
    }

    return value;
}

export function secureBotRoute(request: Request) {
    if (request.headers.get("Authorization") !== requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")) {
        throw json(
            {
                success: false,
                message:
                    "This rotue is only accessible by the discord bot. Your token is simply not matching the right one :)"
            },
            { status: 401 }
        );
    }
}
