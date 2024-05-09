import { db } from "@/.server/db/db";
import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "remix-typedjson";

export async function loader({ request, params }: LoaderFunctionArgs) {
    csrf(request);

    const id = Number(params.id!);

    const server = await db.server.findUnique({
        where: {
            id
        },
        select: {
            server: true,
            bedrock: true
        }
    });
    if (!server) {
        throw new Response("Server not found", {
            status: 404
        });
    }

    const url = new URL(request.url);
    const toServerPrime = url.searchParams.get("prime") === "yes";

    return redirect(
        `/${server.bedrock ? "bedrock/" : ""}${server.server}${
            toServerPrime ? "/panel/subscription" : ""
        }?${url.search}`
    );
}
