import serverConfig from "@/.server/serverConfig";
import { json } from "@remix-run/node";

export function csrf(req: Request) {
	const origin = new URL(req.url).origin;

	if (origin !== serverConfig.redirectUrl)
		throw json({
			success: false,
			message: "Invalid origin"
		});
}
