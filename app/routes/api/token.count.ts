import { type ActionArgs, json } from "@remix-run/node"
import { db } from "~/components/utils/db.server";

export async function action({ request }: ActionArgs) {

    const body: any = JSON.parse(await request.text())

    const headerToken = request.headers.get("Authorization")
    if (headerToken !== process.env.SUPER_DUPER_API_ACCESS_TOKEN) {
        return json({ message: "Super Duper Token does not match the real 2048 bit Super Duper Token!" }, {
            // not allowed status code
            status: 405
        })
    }

    if (!body.token) {
        return json({ message: "Please add token to body!" }, {
            headers: {
                "Content-type": "application/json"
            },
            status: 200
        })
    }

    const valid = (await db.token.findUnique({
        where: {
            token: body.token
        }
    })) ? true : false

    const count = await db.check.count({
        where: {
            Token: {
                token: body.token
            }
        }
    }).catch(() => null)

    return json({ count, valid }, {
        headers: {
            "Content-type": "application/json"
        },
        status: 200
    })

};

// return 404, since without it, it will throw error
export async function loader() {
    throw new Response("Not found", {
        status: 404
    })
};