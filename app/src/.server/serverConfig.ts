import { requireEnv } from "./functions/env.server";

const serverConfig = {
    botApi: requireEnv("BOT_API"),
    api: requireEnv("API_URL"),
    dashUrl: requireEnv("DASH_URL"),
    redirectUrl: requireEnv("REDIRECT_URL"),
    uploadsUrl: requireEnv("UPLOADS_URL"),
    cache: {
        count: 60 * 60 * 12, // 12 hours
        searchServersNTags: 60 * 15, // 15 minutes
        promotedServers: 60 * 5 // 5 minutes
    },
    isDev: process.env.NODE_ENV === "development",
    reconnectEverytimeDbInDev: false
};

export default serverConfig;
