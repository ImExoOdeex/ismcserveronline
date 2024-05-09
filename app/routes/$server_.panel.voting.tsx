import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { encrypt } from "@/.server/modules/encryption";
import { removePortFromHost } from "@/functions/utils";
import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useServerPanelData from "@/hooks/useServerPanelData";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import {
    Badge,
    Button,
    Code,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Text,
    VStack
} from "@chakra-ui/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import type { MetaArgs, MetaFunction } from "@remix-run/react";
import { useState } from "react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ matches, params }: MetaArgs) {
    return [
        {
            title: params.server + "'s voting | IsMcServer.online"
        },
        ...matches[0].meta
    ] as ReturnType<MetaFunction>;
}

export async function action({ request, params }: ActionFunctionArgs) {
    csrf(request);

    const user = await getUser(request);
    invariant(user, "User not found");

    const form = await request.formData();

    const intent = form.get("intent") as "update" | "test";

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const server = await db.server.findFirstOrThrow({
        where: {
            server: params.server?.toLowerCase().trim(),
            bedrock,
            owner_id: user.id
        }
    });

    switch (intent) {
        case "update": {
            try {
                const usingVotifier = form.get("usingVotifier")
                    ? form.get("usingVotifier") === "true"
                    : undefined;
                const votifierHost = form.get("votifierHost")?.toString()
                    ? form.get("votifierHost")?.toString() ?? ""
                    : undefined;
                const votifierPort = form.get("votifierPort")?.toString()
                    ? Number.parseInt(form.get("votifierPort")?.toString() ?? "")
                    : undefined;
                const votifierToken = form.get("votifierToken")
                    ? await encrypt(form.get("votifierToken")!.toString())
                    : undefined;

                if (votifierHost && (votifierHost.length > 250 || votifierHost.length < 1)) {
                    throw new Error("Host is invalid");
                }
                if (votifierPort && (votifierPort < 1 || votifierPort > 65535)) {
                    throw new Error("Port is invalid");
                }
                if (votifierToken && (votifierToken.length < 1 || votifierToken.length > 2000)) {
                    throw new Error("Token is invalid");
                }

                await db.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        using_votifier: usingVotifier,
                        votifier_port: votifierPort,
                        votifier_token: votifierToken,
                        votifier_host: votifierHost
                    }
                });

                return typedjson({
                    success: true
                });
            } catch (e) {
                console.error(e);
                return typedjson({
                    success: false,
                    message: (e as Error).message
                });
            }
        }
        default:
            throw new Error("Invalid intent");
    }
}

export default function ServerPanel() {
    const data = useServerPanelData();

    const progressBar = useProgressBarContext();
    const toggleFetcher = useDebouncedFetcherCallback((_data) => {
        progressBar.done();
    });
    const hostFetcher = useDebouncedFetcherCallback((_data) => {
        progressBar.startAndDone();
    });
    const portFetcher = useDebouncedFetcherCallback((_data) => {
        progressBar.startAndDone();
    });
    const tokenFetcher = useDebouncedFetcherCallback((_data) => {
        progressBar.startAndDone();
    });

    const [usingVotifier, setUsingVotifier] = useState(data.using_votifier ?? false);

    const [votifierHost, setVotifierHost] = useState(
        data.votifier_host ?? removePortFromHost(data.server)
    );
    const [votifierPort, setVotifierPort] = useState(data.votifier_port ?? 8192);
    const [votifierToken, setVotifierToken] = useState(data.votifier_token ?? "");

    return (
        <Flex gap={10} w="100%" flexDir={"column"}>
            <VStack align="start" w="100%">
                <Heading fontSize={"2xl"} fontWeight={600}>
                    Voting
                </Heading>
                <Text>Here you can configure how your players will be rewarded for voting.</Text>
            </VStack>

            <Flex gap={4} flexDir={"column"}>
                <Text fontWeight={600}>You can set it up in 2 ways:</Text>

                <Divider mt={6} />

                <Flex gap={4} flexDir={"column"}>
                    <Flex gap={2} flexDir={"column"} alignItems={"flex-start"}>
                        <Badge colorScheme="green">Recommended</Badge>
                        <Heading fontWeight={600} fontSize="lg">
                            IMCSO Plugin
                        </Heading>
                    </Flex>

                    <Text>
                        While using our plugin you have to install it on your server and put your
                        server's token in the config file. After you've done that, players can run{" "}
                        <Code>/vote reward</Code> command in-game to recieve their reward. You can
                        configure rewards while holding an item you want to give to the player and
                        running <Code>/vote additem</Code> command.
                    </Text>
                </Flex>

                <Divider mt={6} />

                <Flex gap={4} flexDir={"column"}>
                    <Flex
                        gap={4}
                        flexDir={"row"}
                        alignItems={"center"}
                        w={"100%"}
                        justifyContent={"space-between"}
                    >
                        <Flex gap={2} flexDir={"column"} alignItems={"flex-start"}>
                            <Badge colorScheme="blue">Universal</Badge>
                            <Heading fontWeight={600} fontSize="lg">
                                Votifier
                            </Heading>
                        </Flex>

                        <Button
                            variant={usingVotifier ? "brand" : "solid"}
                            onClick={() => {
                                setUsingVotifier(!usingVotifier);
                                progressBar.start();
                                toggleFetcher.submit(
                                    {
                                        intent: "update",
                                        usingVotifier: !usingVotifier
                                    },
                                    {
                                        method: "PATCH",
                                        debounceTimeout: 0
                                    }
                                );
                            }}
                        >
                            {usingVotifier ? "Disable" : "Enable"}
                        </Button>
                    </Flex>
                    <Text>
                        Votifier is a plugin that allows your server to receive votes from various
                        server list websites.
                        <br />
                        To use Votifier, you need to install the plugin on your server and get it's
                        token and (optionally) port.
                    </Text>

                    <FormControl
                        isInvalid={
                            !votifierToken && (votifierToken.length < 1 || votifierPort > 250)
                        }
                    >
                        <FormLabel>Token</FormLabel>
                        <Input
                            maxW={"300px"}
                            value={votifierToken}
                            onChange={(e) => {
                                setVotifierToken(e.target.value);
                                tokenFetcher.submit(
                                    {
                                        intent: "update",
                                        votifierToken: e.target.value
                                    },
                                    {
                                        method: "PATCH",
                                        debounceTimeout: 250
                                    }
                                );
                            }}
                            variant={"filled"}
                        />
                    </FormControl>

                    <FormControl
                        isInvalid={
                            !!votifierHost && (votifierHost.length < 1 || votifierHost.length > 250)
                        }
                    >
                        <FormLabel>Host</FormLabel>
                        <Input
                            maxW={"300px"}
                            value={votifierHost}
                            onChange={(e) => {
                                setVotifierHost(e.target.value);
                                hostFetcher.submit(
                                    {
                                        intent: "update",
                                        votifierHost: e.target.value
                                    },
                                    {
                                        method: "PATCH",
                                        debounceTimeout: 250
                                    }
                                );
                            }}
                            variant={"filled"}
                        />
                    </FormControl>

                    <FormControl
                        isInvalid={
                            !Number.isNaN(votifierPort) &&
                            !!votifierPort &&
                            (votifierPort < 1 || votifierPort > 65535)
                        }
                    >
                        <FormLabel>Port</FormLabel>
                        <Input
                            maxW={"300px"}
                            type="number"
                            value={votifierPort}
                            onChange={(e) => {
                                setVotifierPort(Number.parseInt(e.target.value));
                                portFetcher.submit(
                                    {
                                        intent: "update",
                                        votifierPort: Number.parseInt(e.target.value)
                                    },
                                    {
                                        method: "PATCH",
                                        debounceTimeout: 250
                                    }
                                );
                            }}
                            variant={"filled"}
                        />
                    </FormControl>
                </Flex>
            </Flex>
        </Flex>
    );
}
