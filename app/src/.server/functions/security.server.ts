import serverConfig from "@/.server/serverConfig";
import { json } from "@remix-run/server-runtime";

export function csrf(req: Request) {
    const origin = new URL(req.url).origin;

    if (origin !== serverConfig.dashUrl)
        throw json({
            success: false,
            message: "Invalid origin"
        });
}
