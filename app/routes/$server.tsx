import { Box, Divider, Flex, Heading, HStack, Image, Stack, Text, VStack } from "@chakra-ui/react";
import { json, type LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useRef } from "react";
import Fonts from "~/components/utils/Fonts";

type MinecraftServer = {
    online: boolean;
    host: string;
    ip: string | null;
    port: number | null;
    version: {
        array: Array<string> | null,
        string: string | null | undefined
    } | null;
    protocol: number | null;
    software: string | null;
    plugins: string[];
    map: string | null;
    motd: {
        raw: string | null;
        clean: string | null;
        html: string | null;
    };
    favicon: string | null;
    players: {
        online: number;
        max: number;
        list: { name: string; id: string | null }[];
    };
    ping: number | null;
    debug: {
        status: boolean;
        query: boolean;
        legacy: boolean;
    };
};

export async function loader({ request, params }: LoaderArgs) {

    const server = params.server

    console.log(`fetching http://192.168.0.134:8000/${server}`);

    const serverData = await fetch(`http://192.168.0.134:8000/${server}`, {
        method: 'get'
    })

    const data: MinecraftServer = await serverData.json()

    // const data: MinecraftServer = {
    //     "online": true,
    //     "host": "mc.hypixel.net",
    //     "ip": null,
    //     "port": 25565,
    //     "version": {
    //         "array": [
    //             "1.8 / 1.19"
    //         ],
    //         "string": "Requires MC 1.8 / 1.19"
    //     },
    //     "players": {
    //         "online": 61873,
    //         "max": 100000,
    //         "list": []
    //     },
    //     "protocol": 47,
    //     "software": "Requires MC 1.8 / 1.19",
    //     "plugins": [],
    //     "map": null,
    //     "motd": {
    //         "raw": "§f                §aHypixel Network §c[1.8-1.19]§f\n §6§lBEDWARS ITEM ROTATIONS §7| §4§lSKYBLOCK 0.17.1",
    //         "clean": "                Hypixel Network [1.8-1.19]\n BEDWARS ITEM ROTATIONS | SKYBLOCK 0.17.1",
    //         "html": "<span><span style=\"color: #FFFFFF;\">                </span><span style=\"color: #55FF55;\">Hypixel Network </span><span style=\"color: #FF5555;\">[1.8-1.19]</span><span style=\"color: #FFFFFF;\">\n </span><span style=\"color: #FFAA00; font-weight: bold;\">BEDWARS ITEM ROTATIONS </span><span style=\"color: #AAAAAA;\">| </span><span style=\"color: #AA0000; font-weight: bold;\">SKYBLOCK 0.17.1</span></span>"
    //     },
    //     "favicon": "data:image/png;base64,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",
    //     "ping": 149,
    //     "debug": {
    //         "status": true,
    //         "query": false,
    //         "legacy": false
    //     }
    // }

    return json({ server, data })
};

export default function $server() {
    const lastServer = useRef({})
    const lastData = useRef({})
    const { server, data } = useLoaderData<typeof loader>() || { server: lastServer.current, data: lastData.current }
    useEffect(() => {
        if (server) lastServer.current = server
        if (data) lastData.current = data
    }, [server, data])

    const motd = data.motd.html?.split("\n")
    const bgImageColor = "rgba(0,0,0,.7)"

    return (
        <VStack spacing={'50px'} align='start' maxW='1000px' mx='auto' w='100%' mt={'50px'} px={4}>
            <Fonts />
            {/* Box up */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={5} justifyContent={'space-between'} w='100%'>
                <Image src={data.favicon ?? ""} alt={`${server} favicon`} boxSize='170px' sx={{ imageRendering: "pixelated" }} />

                <VStack spacing={4} flexDir={'column'} justifyContent='center' w='100%' h='170px' align={'center'}>

                    <Flex flexDir={'row'} alignItems='center' justifyContent={'space-between'} w='100%'>
                        <Heading as={'a'} href={`http://${server}`} target="_blank" fontSize='4xl' letterSpacing={'3px'}>{server}</Heading>
                        <HStack spacing={4}>
                            <Box boxSize={'24px'} rounded='full' bg={data.online ? "green.500" : "red.500"} />
                            <Heading fontSize='3xl' letterSpacing={'3px'} color={data.online ? "green.500" : "red.500"}>{data.online ? "Online" : "Offline"}</Heading>
                        </HStack>
                    </Flex>

                    <Flex py={4} flexDir={'column'} w='100%' pos='relative' rounded={'3xl'} justifyContent='center' align={'center'} alignItems='center'>
                        <pre>
                            {motd?.map((m: string) => (
                                <Flex key={m} dangerouslySetInnerHTML={{ __html: m }} w='100%' fontFamily={`Minecraft`} justifyContent='center' align={'center'} alignItems='center' fontSize={'sm'} />
                            ))}
                        </pre>

                        <Box rounded={'xl'} zIndex={-1} pos={'absolute'} top='0' left='0' right='0' bottom={'0'} bgImage={`linear-gradient(${bgImageColor}, ${bgImageColor}), url(/dirt.png)`} bgRepeat={'repeat'} bgSize='30px' />
                    </Flex>
                </VStack>
            </Stack>

            <Divider />

            <VStack spacing={'50px'} align='start' fontWeight={600}>
                <HStack spacing={10}>
                    <Text>Players</Text>
                    <Text>{data.players.online}/{data.players.max}</Text>
                </HStack>
            </VStack>

        </VStack>
    )
}