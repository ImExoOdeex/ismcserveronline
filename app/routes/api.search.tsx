import type { ActionFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import { db } from "../src/.server/db/db";
import { csrf } from "../src/.server/functions/security.server";
import type { SearchServer } from "./search";

export async function action({ request }: ActionFunctionArgs) {
    csrf(request);

    const form = await request.formData();

    const locale = form.get("locale")?.toString();
    const isBedrock = form.get("version")?.toString() === "bedrock";
    const query = form.get("q")?.toString() ?? "";

    const sort = form.get("sort")?.toString() as "hot" | "newest" | "oldest" | undefined;
    const queryLetters = query?.split("");
    const paramsTags = form.get("tags")?.toString();
    invariant(paramsTags, "tags required");
    const tags = JSON.parse(paramsTags) as string[];

    const skip = Number(form.get("skip")?.toString()) || 0;

    const servers = (await db.server.findMany({
        take: 10,
        skip,
        select: {
            id: true,
            server: true,
            bedrock: true,
            favicon: true,
            players: true,
            prime: true,
            motd: true,
            description: true,
            owner_id: true,
            Owner: {
                select: {
                    prime: true
                }
            },
            Tags: {
                select: {
                    name: true
                }
            },
            _count: {
                select: {
                    Vote: {
                        where: {
                            created_at: {
                                gte: dayjs().startOf("month").toDate()
                            }
                        }
                    }
                }
            }
        },
        where: {
            AND: {
                bedrock: isBedrock,
                AND: {
                    OR: [
                        {
                            language: locale === "en" || locale === "us" ? "en" : locale
                        },
                        {
                            language: locale === "en" || locale === "us" ? null : locale
                        }
                    ],
                    ...(() => {
                        if (tags.length > 0) {
                            return {
                                Tags: {
                                    some: {
                                        name: {
                                            in: tags
                                        }
                                    }
                                }
                            };
                        }
                        return {};
                    })()
                },
                OR: [
                    {
                        AND: [
                            ...(() => {
                                if (queryLetters && queryLetters.length > 0) {
                                    return queryLetters.map((letter) => ({
                                        server: {
                                            contains: letter
                                        }
                                    }));
                                }
                                return [];
                            })()
                        ]
                    },
                    (() => {
                        if (!query) return {};

                        return {
                            Tags: {
                                some: {
                                    name: {
                                        contains: query || undefined
                                    }
                                }
                            }
                        };
                    })()
                ],
                server: {
                    startsWith: "%.%",
                    not: {
                        startsWith: "%.%.%.%"
                    }
                }
            }
        },
        orderBy: {
            ...(() => {
                if (sort === "newest") {
                    return {
                        created_at: "desc"
                    };
                }
                if (sort === "oldest") {
                    return {
                        created_at: "asc"
                    };
                }

                return {
                    Vote: {
                        _count: "desc"
                    }
                };
            })()
        }
    })) as unknown as SearchServer[];

    return typedjson({
        servers
    });
}
