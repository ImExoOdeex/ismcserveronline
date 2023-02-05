import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Divider, Flex, Heading, HStack, Icon, Stack, Text, VStack } from "@chakra-ui/react";
import { fetch, json, type MetaFunction, type LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useRef } from "react";
import { BiBug, BiInfoCircle } from "react-icons/bi";
import { getClientIPAddress } from "remix-utils";
import ChecksTable from "~/components/layout/server/ChecksTable";
import Link from "~/components/utils/Link";
import { db } from "~/components/utils/db.server";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";

type BedrockServer = {
    online: boolean;
    host: string;
    port: {
        ipv4: number | null;
        ipv6: number | null;
        srv: number | null;
    };
    edition: string | null;
    version: string | null;
    protocol: number | null;
    guid: string | null;
    id: string | null;
    gamemode: {
        id: number | null;
        name: string | null;
    };
    motd: {
        raw: string | null;
        clean: string | null;
        html: string | null;
    };
    players: {
        online: number;
        max: number;
    };
};

export async function loader({ params, request }: LoaderArgs) {

    const server = params.bedrockServer?.toString().toLowerCase()
    if (!server?.includes(".")) throw new Response(null, {
        status: 404
    })

    const serverData = await fetch(`http://192.168.0.134:8000/bedrock/${server}`, {
        method: 'get'
    })
    const data: BedrockServer = await serverData.json()

    const blockTracking = getCookieWithoutDocument("blockTracking", request.headers.get("cookie") ?? "")

    if (!blockTracking) {
        const IP = getClientIPAddress(request.headers)
        await db.check.create({
            data: {
                server: server,
                online: data.online,
                players: data.players.online,
                bedrock: true,
                source: "WEB",
                client_ip: IP
            }
        })
    }

    const checks = await db.check.findMany({
        where: {
            server: {
                contains: server
            },
            bedrock: true
        },
        select: {
            id: false,
            server: false,
            online: true,
            players: true,
            source: true,
            client_ip: false,
            checked_at: true
        },
        orderBy: {
            id: 'desc'
        },
        take: 20
    })

    return json({ server, data, checks })
};

export const meta: MetaFunction = ({ data }: { data: { server: string, data: BedrockServer } }) => {
    return {
        title: data.server + "'s status | IsMcServer.online"
    };
};

export default function $server() {
    const lastServer = useRef({})
    const lastData = useRef({})
    const lastChecks = useRef({})
    const { server, data, checks } = useLoaderData<typeof loader>() || { server: lastServer.current, data: lastData.current, checks: lastChecks.current }
    useEffect(() => {
        if (server) lastServer.current = server
        if (data) lastData.current = data
        if (checks) lastChecks.current = checks
    }, [server, data, checks])

    console.log(data);

    const motd = data.motd.html?.split("\n")
    const bgImageColor = "rgba(0,0,0,.7)"

    return (
        <VStack spacing={'40px'} align='start' maxW='1000px' mx='auto' w='100%' mt={'50px'} px={4} mb={5}>
            {/* Box up */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={5} justifyContent={'space-between'} w='100%'>

                <VStack spacing={4} flexDir={'column'} justifyContent='center' w='100%' h='170px' align={'center'}>

                    <Flex flexDir={'row'} alignItems='center' justifyContent={'space-between'} w='100%'>
                        <HStack as={'a'} target="_blank" href={`http://${server}`}>
                            <Heading fontSize={{ base: 'lg', sm: '2xl', md: '4xl' }} letterSpacing={'3px'}>{server}</Heading>
                            <ExternalLinkIcon fontSize={'lg'} />
                        </HStack>
                        <HStack spacing={2}>
                            <Box boxSize={'10px'} rounded='full' shadow={`0px 0px 20px ${data.online ? "#38A169" : "#E53E3E"}`} bg={data.online ? "green.500" : "red.500"} />
                            <Heading textShadow={'0px 0px 15px'} fontSize='lg' letterSpacing={'3px'} color={data.online ? "green.500" : "red.500"}
                            >{data.online ? "Online" : "Offline"}</Heading>
                        </HStack>
                    </Flex>

                    <Flex py={4} flexDir={'column'} w='100%' pos='relative' rounded={'3xl'} justifyContent='center' align={'center'} alignItems='center'>
                        <pre>
                            {motd?.map((m: string) => (
                                <Flex key={m} dangerouslySetInnerHTML={{ __html: m }} w='100%' fontFamily={"'Minecraft'"} justifyContent='center' align={'center'} alignItems='center' fontSize={'sm'} />
                            ))}
                        </pre>

                        <Box rounded={'xl'} zIndex={-1} pos={'absolute'} top='0' left='0' right='0' bottom={'0'} bgImage={`linear-gradient(${bgImageColor}, ${bgImageColor}), url(/dirt.png)`} bgRepeat={'repeat'} bgSize='30px' />
                    </Flex>
                </VStack>
            </Stack>

            <Divider />

            <VStack spacing={'30px'} align='start' fontWeight={600}>
                <Heading as={'h1'} fontSize='lg'>General info</Heading>

                <Box>
                    <HStack w='100%' align={'start'} ml={{ base: 0, md: 5 }}>
                        <Flex minW={'150px'}>
                            <VStack spacing={'7px'} align='start' fontWeight={600}>
                                <Text>Players</Text>
                                <Text>Version</Text>
                                <Text>Edition</Text>
                                <Text>Gamemode</Text>
                            </VStack>
                        </Flex>
                        <Flex>
                            <VStack spacing={'7px'} align='start' fontWeight={400}>
                                <Text>{data.players.online} / {data.players.max}</Text>
                                <Text>{data.version}</Text>
                                <Text>{data.edition}</Text>
                                <Text>{data.gamemode.name}</Text>
                            </VStack>
                        </Flex>
                    </HStack>
                </Box>



                <Heading as={'h1'} fontSize='lg'>Debug info</Heading>

                <Box>
                    <HStack w='100%' align={'start'} ml={{ base: 0, md: 5 }}>
                        <Flex minW={'150px'}>
                            <VStack spacing={'7px'} align='start' fontWeight={600}>
                                <Text>Host</Text>
                                <Text>Port</Text>
                                <Text>Protocol</Text>
                                <Text>Guid</Text>
                            </VStack>
                        </Flex>
                        <Flex>
                            <VStack spacing={'7px'} align='start' fontWeight={400}>
                                <Text>{data.host}</Text>
                                <Text>{data.port.ipv4}</Text>
                                <Text>{data.protocol}</Text>
                                <Text>{data.guid}</Text>

                            </VStack>
                        </Flex>
                    </HStack>
                </Box>


            </VStack>

            <Divider />

            <VStack align={'start'} w='100%'>
                <Heading as={'h1'} fontSize='lg'>
                    Last checks
                </Heading>

                {/* @ts-ignore */}
                <ChecksTable checks={checks} server={server} />

            </VStack>

            <Stack direction={{ base: "column", md: "row" }} spacing={{ base: "auto", md: 7 }}>
                <HStack as={"a"} href="https://github.com/ImExoOdeex/ismcserveronline/issues" color={'textSec'} fontWeight={500} _hover={{ textDecor: 'none', color: "initial" }}>
                    <Text>Found bug?</Text>
                    <Icon as={BiBug} />
                </HStack>
                <HStack as={Link} to='/faq' color={'textSec'} fontWeight={500} _hover={{ textDecor: 'none', color: "initial" }}>
                    <Text>Frequently asked questions</Text>
                    <Icon as={BiInfoCircle} />
                </HStack>
            </Stack>
        </VStack>
    )
}