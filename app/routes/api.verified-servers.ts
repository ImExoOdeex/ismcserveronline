import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export interface APIVerifiedServer {
    id: number;
    server: string;
    bedrock: boolean;
    favicon: string | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);

    const user = await getUser(request, {
        id: true
    });
    invariant(user, "User is not logged in");

    const servers = (await db.server.findMany({
        where: {
            owner_id: user.id
        },
        select: {
            id: true,
            server: true,
            bedrock: true,
            favicon: true
        }
    })) as APIVerifiedServer[];

    return typedjson({
        success: true,
        servers
    });
}
