import { Badge, Code, Divider, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import SystemInfo from "~/components/layout/faq/SystemInfo";
import { getCookie, getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import os from "os"
import links from "../components/config/links.json"

export const meta: MetaFunction = () => {
    return {
        title: "FAQ | IsMcServer.online"
    };
};

export async function loader() {

    const bytesToMegabytes = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

    const mem = bytesToMegabytes(process.memoryUsage().heapUsed)
    const totalMem = bytesToMegabytes(os.totalmem())
    const usedMem = totalMem - bytesToMegabytes(os.freemem())
    const platform = os.platform()
    const arch = os.arch()
    const cpu = os.cpus()[0].model
    const processUptimeDays = (process.uptime() / (3600 * 24)).toFixed(2)
    const nodeVersion = process.versions.node
    const v8Version = process.versions.v8
    const mode = process.env.NODE_ENV

    return json({ system: { mem, totalMem, usedMem, platform, cpu, processUptimeDays, nodeVersion, v8Version, arch, mode } })
};

export default function Faq() {

    const lastSystem = useRef({})
    const { system } = useLoaderData() || { system: lastSystem.current }

    useEffect(() => {
        if (system) lastSystem.current = system
    }, [system])

    const name = "tracking"
    const data: any = useRouteLoaderData("root")
    const cookies = data?.cookies

    const [cookieState, setCookieState] = useState<"track" | "no-track">(getCookieWithoutDocument(name, cookies) == "no-track" ? "no-track" : "track")

    function toggleTracking() {
        const cookie = getCookie(name)
        if (cookie == "track" || !cookie) {
            document.cookie = `${name}=no-track`
            setCookieState("no-track")
        } else {
            document.cookie = `${name}=track`
            setCookieState("track")
        }
    }

    useEffect(() => {
        setCookieState(getCookie(name) == "no-track" ? "no-track" : "track" ?? "track")
    }, [])

    return (
        <VStack maxW={'1200px'} w='100%' align={'start'} mx='auto' px={4} spacing={7} mt={10}>

            <VStack w='100%' align={'start'}>
                <Heading as={'h1'} fontSize='lg'>Frequently Asked Questions</Heading>
                <Divider />
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    How do I change port of server I want to check?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    You can use the same way as in game. Add the <Badge>:</Badge> and port you want to check after the domain.
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    How can I disable status for my server?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    To disable status of your server you need to set <Code colorScheme={'purple'}>enable-status</Code>  and <Code colorScheme={'purple'}>enable-query</Code> to false in the <Code colorScheme={'purple'}>server.properties</Code> file. This will result disabling status directly in game, but this won't affect connecting to server.
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    How can I hide plugins on my server?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    If you use Spigot, Bukkit or Craftbukkit set <Code colorScheme={'purple'}>query-plugins</Code> to false in your <Code colorScheme={'purple'}>bukkit.yml</Code> file.
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    Why this page doesn't shows list of online players?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    Minecraft servers only return a maximum of 12 random players when requesting the status. Some servers can override it to show additional information for users.
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    How ping is calculated there?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    Ping is a latency from request to origin server. Our API is located in central europe, that means ping between you and server can be different.
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    Is it really real-time data?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    Yes, our API <b>do not</b> cache any responses!
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    How do I disable my server checks tracking?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    You can <Link variant={"link"} onClick={toggleTracking} userSelect={"none"}>Click here</Link> to toggle tracking. Tracking is <Badge colorScheme={cookieState == "track" ? "green" : "red"}>{cookieState == "track" ? "Enabled" : "Disabled"}</Badge>.
                </Text>
            </VStack>

            <VStack align={'start'}>
                <Heading fontSize={'md'}>
                    How can I contact you?
                </Heading>
                <Text color={'textSec'} fontWeight={500}>
                    You can join our <Link href={links.discordServerInvite} variant={'link'}>discord server</Link>.
                </Text>
            </VStack>

            <Divider />

            <VStack align={'start'}>
                <Heading fontSize={'md'}>Developer info</Heading>
                <Text fontWeight={500}>This project is <Link href="https://github.com/ImExoOdeex/ismcserveronline" variant={'link'}>open-source</Link>. It's made with <Link href="https://remix.run/" variant={'link'}>Remix</Link> and <Link href="https://chakra-ui.com/" variant={'link'}>Chakra UI</Link>. API is written in Typescript, nodeJS.</Text>
                <Text fontWeight={500}>If you found any bug, please <Link href="https://github.com/ImExoOdeex/ismcserveronline/issues" variant={'link'}>create new issue on github</Link>.</Text>
            </VStack>

            <Divider />

            <SystemInfo system={system} />

        </VStack >
    )

}