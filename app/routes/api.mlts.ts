import { db } from "@/.server/db/db";
import { csrf } from "@/.server/functions/security.server";
import { invariant } from "@/functions/utils";
import type { AnyServerModel } from "@/types/minecraftServer";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export interface MLTSServer {
    id: number;
    server: string;
    favicon: string | null;
    players: AnyServerModel["players"];
    description: string | null;
    bedrock: true;
    prime: boolean;
    owner_id: number;
    Owner: {
        prime: boolean;
    };
    Tags: {
        name: string;
    }[];
}

export interface MLTSPromoted {
    id: number;
    color: string;
    Server: MLTSServer;
}

// mlts = more like this server
export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);

    try {
        const url = new URL(request.url);
        const playersParam = url.searchParams.get("players");
        const server = url.searchParams.get("server");
        invariant(server, "Server is required");
        const players = typeof playersParam === "string" ? Number.parseInt(playersParam) : 0;
        const bedrock = url.searchParams.get("bedrock") === "";
        const language = url.searchParams.get("language");

        const [servers, promoted] = await Promise.all([
            db.server.findMany({
                take: 3,
                orderBy: {
                    players: "asc"
                },
                where: {
                    // it's an object with keys: online, max, list
                    players: {
                        path: ["online"],
                        gte: players
                    },
                    server: {
                        startsWith: "%.%",
                        not: {
                            startsWith: "%.%.%.%",
                            contains: server
                        }
                    },
                    language,
                    bedrock
                },
                select: {
                    id: true,
                    server: true,
                    players: true,
                    favicon: true,
                    description: true,
                    bedrock: true,
                    owner_id: true,
                    prime: true,
                    Owner: {
                        select: {
                            prime: true
                        }
                    },
                    Tags: {
                        select: {
                            name: true
                        }
                    }
                }
            }) as Promise<MLTSServer[]>,
            db.promoted.findMany({
                take: 2,
                where: {
                    // it's an object with keys: online, max, list
                    Server: {
                        server: {
                            not: server
                        },
                        language: language || undefined,
                        bedrock
                    },
                    status: "Active"
                },
                select: {
                    id: true,
                    color: true,
                    Server: {
                        select: {
                            id: true,
                            server: true,
                            players: true,
                            online: true,
                            favicon: true,
                            description: true,
                            prime: true,
                            owner_id: true,
                            bedrock: true,
                            Owner: {
                                select: {
                                    prime: true
                                }
                            },
                            Tags: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }) as unknown as Promise<MLTSPromoted[]>
        ]);

        if (servers.length < 3) {
            const serversWithLessPlayers = (await db.server.findMany({
                take: 3 - servers.length,
                orderBy: {
                    players: "asc"
                },
                where: {
                    players: {
                        path: ["online"],
                        lt: players
                    },
                    server: {
                        not: {
                            startsWith: "%.%.%.%",
                            equals: server
                        }
                    },
                    language,
                    bedrock
                },
                select: {
                    id: true,
                    server: true,
                    players: true,
                    favicon: true,
                    description: true,
                    bedrock: true,
                    owner_id: true,
                    prime: true,
                    Owner: {
                        select: {
                            prime: true
                        }
                    },
                    Tags: {
                        select: {
                            name: true
                        }
                    }
                }
            })) as MLTSServer[];

            servers.push(...serversWithLessPlayers);
        }

        return typedjson({
            success: true,
            servers,
            promoted
        });
    } catch (e) {
        throw typedjson(
            {
                success: false,
                message: (e as Error).message
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=60"
                }
            }
        );
    }
}
