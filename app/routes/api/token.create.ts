import type { ActionArgs } from "@remix-run/node"
import { getClientIPAddress } from "remix-utils";
import { db } from "~/components/utils/db.server";
const crypto = require('crypto')

// This is typically POST request to this route. I use it for adding discord server checks. You can't make this request, cuz you dont have super duper 2048 bit access token hah
export async function action({ request }: ActionArgs) {

    const body: any = JSON.parse(await request.text())

    if (body.token !== process.env.SUPER_DUPER_API_ACCESS_TOKEN) {
        return new Response("Super Duper Token does not match the real 2048 bit Super Duper Token!", {
            // not allowed status code
            status: 405
        })
    }

    const IP = body.source === "DISCORD" ? null : getClientIPAddress(request.headers)

    // await db.token.create({
    //     data: {
    //         token: self.crypto.randomUUID(),
    //         user_id: "sdfsdf"
    //     }
    // })

    return null
};

// return 404, since without it, it will throw error
export async function loader() {
    return crypto.randomUUID();
    throw new Response("Not found", {
        status: 404
    })
};