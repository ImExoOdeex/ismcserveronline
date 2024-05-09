import { db } from "@/.server/db/db";
import { getUserId } from "@/.server/db/models/user";
import { getServerInfo } from "@/.server/functions/api.server";
import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import SavedServer from "@/layout/routes/dashboard/SavedServer";
import VerifiedServer from "@/layout/routes/dashboard/VerifiedServer";
import type { ServerModel } from "@/types/minecraftServer";
import { Divider, Flex, Heading, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import type { Server } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Await } from "@remix-run/react";
import { Suspense, memo } from "react";
import { typeddefer, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export interface Guild {
    id: string;
    name: string;
    icon?: string;
    owner: boolean;
    permissions: number;
    features: string[];
    permissions_new: string;
}

export async function action({ request }: ActionFunctionArgs) {
    csrf(request);
    const formData = await request.formData();
    const action = formData.get("action")?.toString() as string;

    switch (action) {
        case "delete": {
            const server = formData.get("server")?.toString() as string;
            const bedrock = formData.get("bedrock")?.toString() === "true";

            const userId = await getUserId(request);
            invariant(userId, "User is not logged in");

            const serverId = await db.savedServer.findFirst({
                where: {
                    Server: {
                        server,
                        bedrock
                    },
                    user_id: userId
                }
            });

            invariant(serverId, "Server not found");

            await db.savedServer.delete({
                where: {
                    id: serverId.id
                }
            });

            return typedjson({
                success: true
            });
        }
        case "refresh": {
            const server = formData.get("server")?.toString() as string;
            const bedrock = formData.get("bedrock")?.toString() === "true";
            const userId = await getUserId(request);
            invariant(userId, "User is not logged in");

            const updatedServerId = await db.savedServer.findFirst({
                where: {
                    Server: {
                        server,
                        bedrock
                    },
                    user_id: userId
                }
            });

            invariant(updatedServerId, "Server not found");

            const data = await getServerInfo(server, bedrock);

            await db.server.update({
                where: {
                    id: updatedServerId.server_id
                },
                data: {
                    online: data.online,
                    players: data.players
                }
            });

            return typedjson({
                success: true
            });
        }
        default: {
            throw new Error("Invalid action");
        }
    }
}

export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);
    const userId = await getUserId(request);

    if (!userId) {
        throw redirect("/login");
    }

    const servers = new Promise((r) => {
        r(
            db.savedServer.findMany({
                where: {
                    user_id: userId
                },
                select: {
                    id: true,
                    Server: {
                        select: {
                            bedrock: true,
                            server: true,
                            favicon: true,
                            online: true,
                            players: true
                        }
                    },
                    created_at: true
                },
                orderBy: {
                    Server: {
                        server: "asc"
                    }
                }
            })
        );
    }) as unknown as Promise<DisplaySavedServer[]>;

    const verifiedServers = new Promise((r) => {
        r(
            db.server.findMany({
                where: {
                    owner_id: userId
                },
                select: {
                    id: true,
                    favicon: true,
                    online: true,
                    players: true,
                    bedrock: true,
                    server: true
                }
            })
        );
    }) as unknown as Promise<
        Pick<Server, "id" | "favicon" | "server" | "players" | "online" | "bedrock">[]
    >;

    return typeddefer({ servers, verifiedServers });
}

export interface DisplaySavedServer {
    id: number;
    Server: {
        bedrock: boolean;
        server: string;
        favicon: string | null;
        online: boolean;
        players: ServerModel.Players<false>;
    };
    created_at: Date;
}

export default function Index() {
    const { servers: deferredServers, verifiedServers } = useAnimationLoaderData<typeof loader>();

    return (
        <VStack display={"flex"} w="100%" align={"start"} spacing={4}>
            <VStack align="start" w="100%">
                <Heading fontSize={"2xl"} fontWeight={600}>
                    Your Servers
                </Heading>
                {/* <Text>
					Here you can see all servers you have saved for later. You can bookmark a server by clicking "Bookmark" on a
					server's page.
				</Text> */}

                <Divider />
            </VStack>

            <Flex
                w="100%"
                flexDir={"column"}
                gap={4}
                rounded={"xl"}
                border="1px solid"
                p={4}
                borderColor={"alpha300"}
            >
                <Text fontSize={"xl"} fontWeight={600}>
                    Verified Servers
                </Text>

                <Suspense
                    fallback={
                        <Flex w="100%" p={5} alignItems={"center"} justifyContent={"center"}>
                            <Spinner size="lg" speed="0.4s" />
                        </Flex>
                    }
                >
                    <Await resolve={verifiedServers}>
                        {(servers) => <VerifiedServerDisplay servers={servers} />}
                    </Await>
                </Suspense>
            </Flex>

            <Flex
                w="100%"
                flexDir={"column"}
                gap={4}
                rounded={"xl"}
                border="1px solid"
                p={4}
                borderColor={"alpha300"}
            >
                <Text fontSize={"xl"} fontWeight={600}>
                    Bookmarked Servers
                </Text>

                <Suspense
                    fallback={
                        <Flex w="100%" p={5} alignItems={"center"} justifyContent={"center"}>
                            <Spinner size="lg" speed="0.4s" />
                        </Flex>
                    }
                >
                    <Await resolve={deferredServers}>
                        {(servers) => <BookmarkedServersDisplay servers={servers} />}
                    </Await>
                </Suspense>
            </Flex>
        </VStack>
    );
}

const VerifiedServerDisplay = memo(function VerifiedServerDisplay({
    servers
}: {
    servers: Pick<Server, "id" | "favicon" | "server" | "players" | "online" | "bedrock">[];
}) {
    return (
        <>
            {servers.length ? (
                <SimpleGrid
                    w="100%"
                    minChildWidth={{ base: "100%", md: "calc(50% - 20px)" }}
                    spacing={5}
                >
                    {servers.map((server) => (
                        <VerifiedServer key={"verified-" + server.id} server={server} />
                    ))}
                </SimpleGrid>
            ) : (
                <Flex
                    bg="alpha"
                    rounded={"xl"}
                    w="100%"
                    maxW="600px"
                    p={5}
                    mx="auto"
                    alignSelf={"center"}
                    alignItems={"center"}
                    justifyContent="center"
                >
                    <Text fontWeight={600}>You don't have any verified servers.</Text>
                </Flex>
            )}
        </>
    );
});

const BookmarkedServersDisplay = memo(function BookmarkedServersDisplay({
    servers
}: { servers: DisplaySavedServer[] }) {
    return (
        <>
            {servers.length ? (
                <SimpleGrid
                    w="100%"
                    minChildWidth={{ base: "100%", md: "calc(50% - 20px)" }}
                    spacing={5}
                >
                    {servers.map((server) => (
                        <SavedServer key={"bookmarked-" + server.id} server={server} />
                    ))}
                </SimpleGrid>
            ) : (
                <Flex
                    bg="alpha"
                    rounded={"xl"}
                    w="100%"
                    maxW="600px"
                    p={5}
                    mx="auto"
                    alignSelf={"center"}
                    alignItems={"center"}
                    justifyContent="center"
                >
                    <Text fontWeight={600}>You don't have any servers bookmarked.</Text>
                </Flex>
            )}
        </>
    );
});
