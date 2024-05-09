import { db } from "@/.server/db/db";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

// it's a public endpoint
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const authorization = request.headers.get("Authorization");
        invariant(authorization, "Authorization header is missing");

        const token = await db.serverToken.findUnique({
            where: {
                token: authorization
            },
            select: {
                Server: {
                    select: {
                        id: true,
                        server: true,
                        prime: true,
                        owner_id: true,
                        Owner: {
                            select: {
                                prime: true
                            }
                        }
                    }
                },
                calls: true
            }
        });
        invariant(token, "Invalid token");

        const url = new URL(request.url);
        const nick = url.searchParams.get("nick") || undefined;

        const thisMonth = url.searchParams.get("thisMonth") === "";
        const inLastHours = url.searchParams.get("hours") || "12";

        const votes = await db.vote.count({
            where: {
                server_id: token.Server.id,
                nick: {
                    equals: nick,
                    mode: "insensitive"
                },
                created_at: {
                    ...(() => {
                        if (thisMonth) {
                            return {
                                gte: dayjs().startOf("month").toDate()
                            };
                        }
                        return {
                            gte: dayjs().subtract(Number(inLastHours), "hour").toDate()
                        };
                    })()
                }
            }
        });

        await db.serverToken.update({
            where: {
                token: authorization
            },
            data: {
                calls: {
                    increment: 1
                }
            }
        });

        return json({
            success: true,
            message: nick
                ? thisMonth
                    ? `${nick} has voted ${votes} times this month`
                    : `${nick} has voted ${votes} times in the last ${inLastHours} hours`
                : `The server has received ${votes} votes in the last ${inLastHours} hours`,
            votes
        });
    } catch (e) {
        return json(
            {
                success: false,
                message: (e as Error).message
            },
            { status: 500 }
        );
    }
}
