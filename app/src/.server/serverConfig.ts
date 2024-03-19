import { requireEnv } from "./functions/env.server";

const serverConfig = {
	botApi: process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://127.0.0.1:3003",
	api: process.env.NODE_ENV === "production" ? "https://api.ismcserver.online" : "https://api.ismcserver.online", //http://localhost:3004
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
