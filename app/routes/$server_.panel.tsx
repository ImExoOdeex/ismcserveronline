import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { decrypt } from "@/.server/modules/encryption";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useEventSourceCallback from "@/hooks/useEventSourceCallback";
import useRootData from "@/hooks/useRootData";
import Sidebar from "@/layout/routes/server/panel/Sidebar";
import { Box, Button, Divider, Flex, Heading, useColorMode, useToast } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useCallback } from "react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const user = await getUser(request);
    invariant(user, "User is not logged in");

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const server = await db.server
        .findFirst({
            where: {
                server: params.server?.toLowerCase(),
                bedrock
            },
            select: {
                owner_id: true,
                id: true,
                server: true,
                bedrock: true,
                favicon: true,
                message_from_owner: true,
                online: true,
                players: true,
                vote_webhook_url: true,
                vote_webhook_password: true,
                prime: true,
                subId: true,
                using_votifier: true,
                votifier_port: true,
                votifier_token: true,
                votifier_host: true
            }
        })
        .then(async (server) => {
            if (!server) return null;

            return {
                ...server,
                vote_webhook_password: server.vote_webhook_password
                    ? await decrypt(server.vote_webhook_password)
                    : null,
                votifier_token: server.votifier_token ? await decrypt(server.votifier_token) : null
            };
        });
    if (!server) throw new Response("Server not found", { status: 404 });
    if (!server.owner_id) throw new Response("Server not verified", { status: 404 });

    if (server.owner_id !== user.id)
        throw new Response("You are not the owner of this server", { status: 403 });

    return typedjson({
        server
    });
}

export default function ServerPanel() {
    const { dashUrl } = useRootData();
    const { server } = useAnimationLoaderData<typeof loader>();
    const toast = useToast();

    const copyVisitLink = useCallback(() => {
        const link = `${dashUrl}/${server.bedrock ? "bedrock/" : ""}${server.server}`;

        navigator.clipboard.writeText(link).then(() => {
            toast({
                title: "Copied visit link",
                description: `${link}`,
                status: "success",
                duration: 3000
            });
        });
    }, [dashUrl, server.server, server.bedrock, toast]);

    const { colorMode } = useColorMode();

    useEventSourceCallback(
        `/api/sse/vote?id=${server.id}`,
        {
            event: "new-vote"
        },
        (sourceData) => {
            toast({
                description: `${sourceData.nick} has voted for ${server.server}!`,
                status: "info",
                containerStyle: {
                    fontWeight: 500
                },
                isClosable: false
            });
        }
    );

    return (
        <Flex flexDir={"column"} w="100%" gap={10} maxW={"1400px"} mx="auto" px={4} mt={5}>
            <Flex flexDir={"column"} w="100%" gap={4}>
                <Flex w="100%" alignItems={"center"} justifyContent={"space-between"}>
                    <Heading fontSize={"2xl"}>
                        <Box
                            as="span"
                            bgClip="text"
                            bgGradient={`linear(to-r, ${
                                colorMode === "light" ? "#d16ede" : "#da92e4"
                            }, #866ec7)`}
                        >
                            {server.server}'s
                        </Box>{" "}
                        Panel
                    </Heading>
                    <Button onClick={copyVisitLink}>Copy visit link</Button>
                </Flex>

                <Divider />
            </Flex>

            <Flex
                gap={10}
                w="100%"
                flexDir={{
                    base: "column",
                    md: "row"
                }}
            >
                <Sidebar
                    server={server.server}
                    bedrock={server.bedrock}
                    favicon={server.favicon}
                    serverPrime={server.prime}
                />
                <Outlet />
            </Flex>
        </Flex>
    );
}
