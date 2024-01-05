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

export function requireEnv(key: string) {
	const value = process.env[key];
	if (!value) throw new Error(`${key} is not set.`);

	return value;
}
