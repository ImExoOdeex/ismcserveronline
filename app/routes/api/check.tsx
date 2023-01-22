
import type { ActionArgs } from "@remix-run/node"
import { getClientIPAddress } from "remix-utils";
import { db } from "~/components/utils/db.server";
export async function action({ request }: ActionArgs) {
    const body: any = JSON.parse(await request.text())
    console.log("body:", body);

    const IP = getClientIPAddress(request.headers)

    await db.check.create({
        data: {
            server: body.server,
            online: body.online,
            players: body.players,
            bedrock: false,
            source: body.source ?? "WEB",
            client_ip: IP
        }
    })

    return null
};

export async function loader() {
    throw new Response(null, {
        status: 404
    })
};