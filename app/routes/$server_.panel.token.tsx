import { db } from "@/.server/db/db";
import { getUserId } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import { CopyIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
    Button,
    Divider,
    Flex,
    HStack,
    Heading,
    Icon,
    IconButton,
    Text,
    VStack,
    useToast
} from "@chakra-ui/react";
import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaArgs,
    MetaFunction
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { RiAiGenerate } from "react-icons/ri";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ params, matches }: MetaArgs) {
    return [
        {
            title: `${params.server} token | IsMcServer.online`
        },
        ...matches[0].meta
    ] as ReturnType<MetaFunction>;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
    csrf(request);

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const server = await db.server.findFirst({
        where: {
            server: params.server?.toLowerCase(),
            bedrock
        },
        select: {
            id: true
        }
    });
    invariant(server, "Server not found");

    const token = await db.serverToken
        .findUnique({
            where: {
                server_id: server.id
            },
            select: {
                id: true,
                token: true,
                calls: true,
                created_at: true
            }
        })
        .catch(() => null);

    return typedjson({
        token
    });
}

export async function action({ request, params }: ActionFunctionArgs) {
    csrf(request);
    const userId = await getUserId(request);
    invariant(userId, "User is not logged in");

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const server = await db.server.findFirst({
        where: {
            server: params.server?.toLowerCase(),
            bedrock
        },
        select: {
            id: true
        }
    });
    invariant(server, "Server not found");

    const serverToken = await db.serverToken.findFirst({
        where: {
            server_id: server.id
        },
        select: {
            id: true
        }
    });
    invariant(!serverToken, "Token already exists");

    const token = crypto.randomUUID();

    await db.serverToken.create({
        data: {
            token: token,
            server_id: server.id
        }
    });

    return typedjson({
        success: true
    });
}

export default function ServerPanel() {
    const { token } = useAnimationLoaderData<typeof loader>();

    const [show, setShow] = useState(false);

    const toast = useToast();

    return (
        <Flex flexDir={"column"} gap={4} alignItems={"flex-start"}>
            <VStack align="start" w="100%">
                <Heading fontSize={"2xl"} fontWeight={600}>
                    Your API Token
                </Heading>
                <Text>Here you can generate your token for our API.</Text>
            </VStack>

            <Flex
                flexDir={{
                    base: "column",
                    md: "row"
                }}
                gap={4}
                alignItems={{
                    base: "flex-start",
                    md: "center"
                }}
                p={4}
                rounded={"xl"}
                border="1px solid"
                borderColor={"alpha300"}
                w="100%"
                justifyContent={"space-between"}
            >
                <Flex flexDir={"column"} gap={0.5} flex={1}>
                    <Text fontWeight={500}>Token</Text>
                    <Text fontSize={"xl"} fontWeight={600}>
                        {token ? (
                            <HStack>
                                <Text
                                    fontSize={{
                                        base: "sm",
                                        md: "xl"
                                    }}
                                    fontWeight={600}
                                    fontFamily={"monospace"}
                                >
                                    {show ? token.token : "*".repeat(token.token.length)}
                                </Text>
                                <IconButton
                                    onClick={() => setShow(!show)}
                                    aria-label={"Show Token"}
                                    icon={!show ? <ViewIcon /> : <ViewOffIcon />}
                                    size={"sm"}
                                    bg="alpha"
                                    _hover={{
                                        bg: "alpha100"
                                    }}
                                    _active={{
                                        bg: "alpha200"
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        navigator.clipboard.writeText(token.token).then(() => {
                                            toast({
                                                title: "Token copied to clipboard.",
                                                status: "success",
                                                duration: 3000,
                                                variant: "subtle",
                                                position: "bottom-right",
                                                isClosable: true
                                            });
                                        });
                                    }}
                                    aria-label={"Copy Token"}
                                    icon={<CopyIcon />}
                                    size={"sm"}
                                    bg="alpha"
                                    _hover={{
                                        bg: "alpha100"
                                    }}
                                    _active={{
                                        bg: "alpha200"
                                    }}
                                />
                            </HStack>
                        ) : (
                            "None"
                        )}
                    </Text>
                </Flex>

                {token ? (
                    <HStack
                        w={{
                            base: "100%",
                            md: "25%"
                        }}
                    >
                        <Flex flexDir={"column"} gap={0.5} flex={1}>
                            <Text fontWeight={500}>Calls</Text>
                            <Text fontSize={"xl"} fontWeight={600}>
                                <Text fontSize={"xl"} fontWeight={600} fontFamily={"monospace"}>
                                    {token.calls}
                                </Text>
                            </Text>
                        </Flex>
                    </HStack>
                ) : (
                    <GenerateToken />
                )}
            </Flex>

            <Button
                size={"lg"}
                leftIcon={<Icon as={HiOutlineDocumentDuplicate} boxSize={5} />}
                as={Link}
                to={"/api/documentation"}
            >
                API Documentation
            </Button>

            <Divider my={10} />

            <Text>
                You can use your token to access our voting API. You can recieve your server's vote
                count of any user or overall vote count.
            </Text>
        </Flex>
    );
}

function GenerateToken() {
    const fetcher = useFetcher();

    return (
        <fetcher.Form method="POST">
            <Button
                variant={"brand"}
                type="submit"
                isLoading={fetcher.state !== "idle"}
                rightIcon={<Icon as={RiAiGenerate} />}
            >
                Generate Token
            </Button>
        </fetcher.Form>
    );
}
