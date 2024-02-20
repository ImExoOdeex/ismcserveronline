import { json } from "@remix-run/node";
import serverConfig from "../serverConfig.server";

export function csrf(req: Request) {
	const origin = new URL(req.url).origin;

	if (origin !== serverConfig.dashUrl)
		throw json({
			success: false,
			message: "Invalid origin"
		});
}
