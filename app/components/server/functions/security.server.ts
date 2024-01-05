import serverConfig from "../serverConfig.server";

export function requireDomain(req: Request) {
	const origin = new URL(req.url).origin;

	if (origin !== serverConfig.dashUrl) throw new Error("Invalid domain request");
}
