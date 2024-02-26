import serverConfig from "@/.server/serverConfig";

export function generateVerificationCode() {
	const base = Math.random().toString(36).substring(2, 8);

	return `${serverConfig.redirectUrl}-verification-${base}`;
}
