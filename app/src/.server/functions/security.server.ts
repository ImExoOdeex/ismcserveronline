import serverConfig from "@/.server/serverConfig";
import { json } from "@remix-run/server-runtime";

export function csrf(req: Request) {
    if (process.env.NODE_ENV === "development") return;
    const url = new URL(req.url);
    const origin = url.origin;

    if (origin !== serverConfig.dashUrl)
        throw json({
            success: false,
            message: "Invalid origin"
        });
}
