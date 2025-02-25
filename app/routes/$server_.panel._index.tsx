import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import { getFullFileUrl } from "@/functions/storage";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useAnyPrime from "@/hooks/useAnyPrime";
import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import Link from "@/layout/global/Link";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import DragAndDropFile from "@/layout/routes/server/panel/DragAndDropFile";
import LanguageChanger from "@/layout/routes/server/panel/LanguageChanger";
import {
    StatBox,
    Tags,
    TemplateAlertDialog
} from "@/layout/routes/server/panel/ServerPanelComponents";
import type { ServerModel } from "@/types/minecraftServer";
import languages from "@/utils/languages";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
    Divider,
    Flex,
    IconButton,
    Image,
    SimpleGrid,
    Text,
    Textarea,
    Tooltip,
    useToast
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs } from "@remix-run/node";
import type { MetaFunction, ShouldRevalidateFunctionArgs } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ matches, params }: MetaArgs) {
    return [
        {
            title: params.server + "'s panel | IsMcServer.online"
        },
        ...matches[0].meta
    ] as ReturnType<MetaFunction>;
}

export function shouldRevalidate(args: ShouldRevalidateFunctionArgs) {
    if (
        args.actionResult?.revalidate === true ||
        args.currentUrl.pathname !== args.nextUrl.pathname
    )
        return true;

    return false;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    csrf(request);

    const user = await getUser(request);
    invariant(user, "User is not logged in");

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";
    const server = await db.server.findFirst({
        where: {
            server: params.server?.toLowerCase(),
            bedrock
        },
        select: {
            id: true,
            server: true,
            bedrock: true,
            online: true,
            players: true,
            owner_id: true,
            banner: true,
            Tags: true,
            background: true,
            prime: true,
            description: true,
            message_from_owner: true,
            language: true
        }
    });
    if (!server) throw new Response("Server not found", { status: 404 });
    if (!server.owner_id) throw new Response("Server not verified", { status: 404 });

    const lastMonth = dayjs().subtract(1, "month").startOf("month");
    const todaysDayInLastMonth = dayjs().subtract(1, "month");

    const promises = [
        db.vote.count({
            where: {
                server_id: server.id,
                created_at: {
                    gte: dayjs().startOf("month").toDate()
                }
            }
        }),
        db.vote.count({
            where: {
                server_id: server.id,
                created_at: {
                    gte: dayjs().startOf("month").toDate()
                }
            }
        }),
        db.check.count({
            where: {
                server_id: server.id
            }
        }),
        db.check.count({
            where: {
                server_id: server.id,
                checked_at: {
                    gte: dayjs().startOf("month").toDate()
                }
            }
        }),
        db.comment.count({
            where: {
                server_id: server.id
            }
        }),
        db.vote.count({
            where: {
                server_id: server.id,
                created_at: {
                    gte: lastMonth.toDate(),
                    lte: todaysDayInLastMonth.toDate()
                }
            }
        }),
        db.check.count({
            where: {
                server_id: server.id,
                checked_at: {
                    gte: lastMonth.toDate(),
                    lte: todaysDayInLastMonth.toDate()
                }
            }
        })
    ];

    // didnt want to defer it, cause too much work
    const [
        votes,
        votesInThisMonth,
        checks,
        checksInThisMonth,
        comments,
        votesInLastMonth,
        checksInLastMonth
    ] = await Promise.all(promises);

    return typedjson(
        {
            server,
            votes,
            votesInThisMonth,
            checks,
            checksInThisMonth,
            comments,
            votesInLastMonth,
            checksInLastMonth
        },
        cachePrefetch(request)
    );
}

// updating server's language & descriptions. tags are in /api/tags
export async function action({ request, params }: ActionFunctionArgs) {
    csrf(request);

    const form = await request.formData();

    const intent = form.get("intent")?.toString() as
        | "description"
        | "message"
        | "language"
        | undefined;

    const user = await getUser(request);
    invariant(user, "User is not logged in");

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const server = await db.server.findFirst({
        where: {
            server: params.server?.toLowerCase(),
            bedrock
        },
        select: {
            owner_id: true,
            id: true
        }
    });

    invariant(server, "Server not found");
    invariant(server.owner_id === user.id, "You are not the owner of the server");

    try {
        switch (intent) {
            case "language": {
                let language = form.get("language")?.toString().toLowerCase() as string | undefined;
                invariant(language, "Language is required");

                language = language === "en" ? "us" : language;
                // check if language is valid
                const codes = languages.map((lang) => lang.countryCode.toLowerCase());
                invariant(codes.includes(language), "Language is not valid");
                language = language === "us" ? "en" : language;

                await db.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        language
                    }
                });

                return typedjson({
                    success: true
                });
            }
            case "description": {
                const description = form.get("description")?.toString() as string | undefined;
                // allow description to be 0 - 100 characters
                invariant(
                    description?.length && description.length <= 150,
                    "Description is required and must be less than 150 characters"
                );
                await db.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        description
                    }
                });
                return typedjson({
                    success: true
                });
            }
            case "message": {
                const message = form.get("message")?.toString() as string | undefined;
                // allow message to be 0 - 1000 characters
                invariant(
                    message?.length && message.length <= 1000,
                    "Message is required and must be less than 1000 characters"
                );
                await db.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        message_from_owner: message
                    }
                });
                return typedjson({
                    success: true
                });
            }
        }
    } catch (e) {
        return typedjson({
            success: false,
            message: (e as Error).message
        });
    }
}

export default function ServerPanel() {
    const {
        server,
        checks,
        checksInThisMonth,
        comments,
        votes,
        votesInThisMonth,
        checksInLastMonth,
        votesInLastMonth
    } = useAnimationLoaderData<typeof loader>();

    const hasPrime = useAnyPrime(server);

    const { startAndDone } = useProgressBarContext();
    const toast = useToast();
    const descriptionFetcher = useDebouncedFetcherCallback((data) => {
        startAndDone();
        if (data.success) {
            console.log("description updated", data);
        } else {
            toast({
                title: data.message,
                status: "error"
            });
        }
    });
    const messageFetcher = useDebouncedFetcherCallback((data) => {
        startAndDone();
        if (data.success) {
            console.log("message updated", data);
        } else {
            toast({
                title: data.message,
                status: "error"
            });
        }
    });

    const [description, setDescription] = useState(server.description);
    const [message, setMessage] = useState(server.message_from_owner);

    return (
        // setting a key, so it rerenders when the server changes
        <Flex gap={10} w="100%" flexDir={"column"} key={server.server}>
            <Flex gap={4} w="100%" flexDir={"column"}>
                <Text fontSize={"2xl"} fontWeight={600}>
                    Statistics
                </Text>

                {/* Stats in this month */}
                <Flex flexDir={"column"} gap={2}>
                    <Text color={"textSec"} fontSize={"lg"} fontWeight={600}>
                        This month
                    </Text>
                    <SimpleGrid minChildWidth={"250px"} w="100%" gap={4}>
                        <StatBox
                            title={"Votes in this month"}
                            value={votesInThisMonth}
                            helper={votesInLastMonth}
                        />
                        <StatBox
                            title={"Checks in this month"}
                            value={checksInThisMonth}
                            helper={checksInLastMonth}
                        />
                    </SimpleGrid>
                </Flex>

                {/* Stats lifetime */}
                <Flex flexDir={"column"} gap={2}>
                    <Text color={"textSec"} fontSize={"lg"} fontWeight={600}>
                        Total
                    </Text>
                    <SimpleGrid minChildWidth={"250px"} w="100%" gap={4}>
                        <StatBox title={"Votes"} value={votes} />
                        <StatBox title={"Checks"} value={checks} />
                        <StatBox title={"Comments"} value={comments} />
                    </SimpleGrid>
                </Flex>
            </Flex>

            <Divider />

            <Flex gap={10} w="100%" flexDir={"column"}>
                {/* Server info */}
                <Flex flexDir={"column"} gap={4} w={"100%"}>
                    <Text fontSize={"2xl"} fontWeight={600}>
                        Server Information
                    </Text>

                    <Flex gap={2} flexDir={{ base: "column", md: "row" }}>
                        <Flex
                            p={4}
                            rounded="xl"
                            border="1px solid"
                            borderColor={"alpha300"}
                            flexDir={"column"}
                            w="100%"
                            gap={1}
                        >
                            <Text fontWeight={600}>Server Status</Text>

                            <Text
                                color={server.online ? "green" : "red"}
                                fontSize={"2xl"}
                                fontWeight={600}
                            >
                                {server.online ? "Online" : "Offline"}
                            </Text>
                        </Flex>

                        <Flex
                            p={4}
                            rounded="xl"
                            border="1px solid"
                            borderColor={"alpha300"}
                            flexDir={"column"}
                            w="100%"
                            gap={1}
                        >
                            <Text fontWeight={600}>Current Players</Text>

                            <Text color={"textSec"} fontSize={"2xl"} fontWeight={600}>
                                {(server.players as any as ServerModel.Players<any>).online}
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>

                {/* Language */}
                <Flex flexDir={"column"} gap={4} w={"100%"}>
                    <Text fontSize={"xl"} fontWeight={600}>
                        Language
                    </Text>

                    <LanguageChanger locale={server.language} />
                </Flex>

                {/* Tags */}
                <Flex flexDir={"column"} gap={4} w={"100%"}>
                    <Tags tags={server.Tags.map((tag) => tag.name)} serverId={server.id} />
                </Flex>

                {/* Description */}
                <Flex flexDir={"column"} gap={4} w={"100%"}>
                    <Flex flexDir="column">
                        <Text fontSize={"xl"} fontWeight={600}>
                            Short Description
                        </Text>
                        <Text color={"textSec"}>
                            Short description will be showed in search results and in the server's
                            page.
                        </Text>
                    </Flex>

                    <Textarea
                        value={description || ""}
                        variant={"filled"}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            descriptionFetcher.submit(
                                {
                                    intent: "description",
                                    description: e.target.value
                                },
                                {
                                    debounceTimeout: 1000,
                                    method: "PATCH"
                                }
                            );
                        }}
                    />
                    <Text color={"textSec"} fontSize={"sm"} mt={-3} textAlign={"end"}>
                        {description?.length || 0}/150
                    </Text>
                </Flex>

                {/* Message from the owner */}
                <Flex flexDir={"column"} gap={4} w={"100%"}>
                    <Flex flexDir="column">
                        <Text fontSize={"xl"} fontWeight={600}>
                            Message from the owner
                        </Text>
                        <Text color={"textSec"}>
                            This message will be shown on voting page. You can use it to inform
                            players about how they can receive rewards for voting on your server!
                        </Text>
                    </Flex>

                    <Textarea
                        value={message || ""}
                        variant={"filled"}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            messageFetcher.submit(
                                {
                                    intent: "message",
                                    message: e.target.value
                                },
                                {
                                    debounceTimeout: 1000,
                                    method: "PATCH"
                                }
                            );
                        }}
                    />
                    <Text color={"textSec"} fontSize={"sm"} mt={-3} textAlign={"end"}>
                        {message?.length || 0}/1000
                    </Text>
                </Flex>

                {/* Banner */}
                <Flex flexDir={"column"} gap={2}>
                    <Flex w="100%" alignItems={"center"} gap={4} justifyContent={"space-between"}>
                        <Flex flexDir={"column"}>
                            <Text fontSize={"xl"} fontWeight={600}>
                                Banner
                            </Text>
                            <Text color={"textSec"}>
                                Upload a banner for your server. It will be displayed on the
                                server's page.
                            </Text>
                        </Flex>

                        <TemplateAlertDialog />
                    </Flex>

                    {server.banner && (
                        <Image
                            src={getFullFileUrl(server.banner, "banner")}
                            alt={`${server.server}'s banner`}
                            w="100%"
                        />
                    )}
                    <DragAndDropFile fileName="banner" serverId={server.id} />
                </Flex>

                {/* Background */}
                <Flex flexDir={"column"} gap={2}>
                    <Flex w="100%" alignItems={"center"} gap={4} justifyContent={"space-between"}>
                        <Flex flexDir={"column"}>
                            <Text fontSize={"lg"} fontWeight={600}>
                                Background
                            </Text>
                            <Text color={"textSec"}>
                                Upload own background for your server. It will be displayed in the
                                Background.
                            </Text>
                        </Flex>

                        {!hasPrime && (
                            <Tooltip label="This feature requires prime subscription." hasArrow>
                                <IconButton
                                    as={Link}
                                    to={`/${server.bedrock ? "bedrock/" : ""}${server.server
                                        }/panel/subscription`}
                                    aria-label="Info"
                                    _hover={{ bg: "rgba(255, 119, 0, 0.1)" }}
                                    icon={
                                        <InfoOutlineIcon
                                            color="orange"
                                            filter={
                                                "drop-shadow(0px 0px 6px rgba(255, 119, 0, 0.5))"
                                            }
                                        />
                                    }
                                    variant={"ghost"}
                                />
                            </Tooltip>
                        )}
                    </Flex>

                    {server.background && (
                        <Image
                            src={getFullFileUrl(server.background, "background")}
                            alt={`${server.server}'s banner`}
                            w="100%"
                        />
                    )}
                    <Flex
                        w="100%"
                        opacity={hasPrime ? 1 : 0.5}
                        flexDir={"column"}
                        cursor={hasPrime ? "pointer" : "not-allowed"}
                        gap={2}
                    >
                        <Flex pointerEvents={hasPrime ? "auto" : "none"}>
                            <DragAndDropFile fileName="background" serverId={server.id} />
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
