export function requireSuperDuperToken() {
	const token = process.env.SUPER_DUPER_API_ACCESS_TOKEN;

	if (!token) throw new Error("Super duper token is not set.");

	return token;
}

export function requireAPIToken() {
	const token = process.env.API_TOKEN;

	if (!token) throw new Error("API token is not set.");

	return token;
}

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
	"STRIPE_WEBHOOK"
] as const;

type Env = (typeof envs)[number];

export function requireEnv(key: Env) {
	console.log("key", key);
	const value = process.env[key];
	if (!value) throw new Error(`${key} is not set.`);

	return value;
}
