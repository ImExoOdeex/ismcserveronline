import { db } from "@/.server/db/db";
import { requireEnv } from "@/.server/functions/env.server";
import { invariant } from "@/functions/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const token = request.headers.get("Authorization")?.trim();

        if (token !== requireEnv("TESTING_KEY")) {
            invariant(token, "Authorization header is not valid.");
        }

        const form = await request.formData();
        const nick = form.get("nick")?.toString().trim();
        const serverToken = form.get("token")?.toString().trim();
        invariant(nick, "Nick not found in search params.");
        invariant(serverToken, "Token not found in search params.");

        const server = await db.serverToken.findUniqueOrThrow({
            where: {
                token: serverToken
            }
        });

        await db.vote.create({
            data: {
                nick,
                user_id: 1,
                server_id: server.server_id
            }
        });

        return json({
            success: true,
            message: `Created vote for ${nick}.`
        });
    } catch (e) {
        return json({
            success: false,
            message: "message" in (e as any) ? (e as Error).message : "An error occurred."
        });
    }
}
