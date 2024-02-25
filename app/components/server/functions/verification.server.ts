import serverConfig from "../serverConfig.server";

export function generateVerificationCode() {
	const base = Math.random().toString(36).substring(2, 8);

	return `${serverConfig.redirectUrl}-verification-${base}`;
}
