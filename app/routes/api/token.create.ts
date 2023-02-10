import { type ActionArgs, json } from "@remix-run/node"
import { db } from "~/components/utils/db.server";
import crypto from "crypto"

export async function action({ request }: ActionArgs) {

    /* 
        body: 
        {
            userId: string
        }
    */
    const body: any = JSON.parse(await request.text())

    const headerToken = request.headers.get("Authorization")
    if (!headerToken) return new Response("Super Duper Token does not match the real 2048 bit Super Duper Token!", {
        // not allowed status code
        status: 405
    })

    if (headerToken !== process.env.SUPER_DUPER_API_ACCESS_TOKEN) {
        return new Response("Super Duper Token does not match the real 2048 bit Super Duper Token!", {
            // not allowed status code
            status: 405
        })
    }

    crypto.generateKey("aes", { length: 256 }, async (err, key) => {

        if (err) return new Response("Couldn't generate token!", {
            status: 500
        })
        const token = key.export().toString("hex")

        await db.token.create({
            data: {
                token: token,
                user_id: body.userId
            }
        })

        return json({ token }, {
            headers: {
                "Content-type": "application/json"
            },
            status: 200
        })
    });

    return null
};

// return 404, since without it, it will throw error
export async function loader() {
    throw new Response("Not found", {
        status: 404
    })
};