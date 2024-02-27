import { requireEnv } from "./functions/env.server";

const serverConfig = {
	botApi: process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://127.0.0.1:3003",
	api: process.env.NODE_ENV === "production" ? "https://api.ismcserver.online" : "https://api.ismcserver.online", // http://localhost:3004
	dashUrl: requireEnv("DASH_URL"),
	redirectUrl: requireEnv("REDIRECT_URL"),
	uploadsUrl: requireEnv("UPLOADS_URL"),
	cache: {
		count: 60 * 60 * 12 /* 12 hours */,
		sampleServers: 60 * 60 // 1 hour
	},
	isDev: process.env.NODE_ENV === "development",
	enablePrismaRedisCache: false,
	reconnectEverytimeDbInDev: true
};

export default serverConfig;
