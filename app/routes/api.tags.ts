import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { normalizeTag } from "@/functions/utils";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);

    const url = new URL(request.url);
    const search = url.searchParams.get("search") as string | undefined;
    invariant(search, "search is required");

    const tags = await db.tag
        .findMany({
            where: {
                name: {
                    contains: search
                }
            },
            take: 5
        })
        .then((tags) => tags.map((tag) => tag.name));

    return typedjson({
        tags
    });
}

export async function action({ request }: ActionFunctionArgs) {
    csrf(request);

    try {
        const user = await getUser(request);
        invariant(user, "User is required");

        const form = await request.formData();
        const newTag = form.get("tag") as string | undefined;
        const serverId = Number(form.get("serverId")) as number | undefined;
        invariant(newTag, "newTag is required");
        invariant(serverId, "serverId is required");

        switch (request.method) {
            case "PATCH":
            case "POST":
            case "PUT": {
                const doesTagExist = await db.tag.findUnique({
                    where: {
                        name: newTag
                    }
                });

                // min length is 2 and max is 20
                invariant(
                    newTag.length >= 2 && newTag.length <= 20,
                    "Tag must be between 2 and 20 characters"
                );

                // await new Promise((resolve) => setTimeout(resolve, 1000));

                // check if user is the owner of the server
                const server = await db.server.findFirstOrThrow({
                    where: {
                        id: serverId,
                        owner_id: user.id
                    }
                });

                const tag =
                    doesTagExist ||
                    (await db.tag.create({
                        data: {
                            name: normalizeTag(newTag),
                            createdByServerId: serverId
                        }
                    }));

                await db.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        Tags: {
                            connect: {
                                id: tag.id
                            }
                        }
                    }
                });

                return typedjson({
                    success: true,
                    tag
                });
            }
            case "DELETE": {
                const tag = await db.tag.findUnique({
                    where: {
                        name: newTag
                    }
                });

                // check if user is the owner of the server
                const server = await db.server.findFirstOrThrow({
                    where: {
                        id: serverId,
                        owner_id: user.id
                    }
                });

                const updated = await db.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        Tags: {
                            disconnect: {
                                id: tag?.id
                            }
                        }
                    },
                    select: {
                        Tags: {
                            select: {
                                name: true
                            }
                        }
                    }
                });

                return typedjson({
                    success: true,
                    tags: updated.Tags.map((tag) => tag.name)
                });
            }
        }
    } catch (e) {
        return typedjson({
            success: false,
            error: (e as Error).message
        });
    }
}
