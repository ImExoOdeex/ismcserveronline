import invariant from "tiny-invariant";

invariant(process.env.DASH_URL, "DASH_URL environment variable is required");

const serverConfig = {
	botApi: process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3003",
	api: process.env.NODE_ENV === "production" ? "https://api.ismcserver.online" : "https://api.ismcserver.online", // http://localhost:3004
	dashUrl: process.env.DASH_URL,
	redirectUrl: process.env.REDIRECT_URL,
	cache: {
		count: 60 * 60 * 12 /* 12 hours */,
		sampleServers: 60 * 60 // 1 hour
	}
};

export default serverConfig;
