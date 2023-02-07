import { Badge, Divider, Heading, Text, VStack } from "@chakra-ui/react";

export default function HowToUse() {
    return (
        <VStack spacing={10} width={"100%"} align={"start"} mb={10}>

            {/* how to use */}
            <VStack spacing={3} width={"100%"} align={"start"}>
                <Heading as={"h1"} fontSize={"xl"}>How to use this tool?</Heading>
                <Divider />
                <Text color={"textSec"} letterSpacing={'1px'} textAlign={"justify"}>
                    Simply enter the server address you want to check in input and click <b>Search</b> button. The fetching state shouldn't take more than 5 seconds. After that, you will see the server status, including the server version, player count, and maximum player count. If the server is online, you can then click the big domain text to view the website in new browser tab. The website may also provide additional information about the server, such as a players list, host, software and plugins used. Use this tool to easily check the status of your favorite Minecraft servers and quickly join the ones that are online.
                </Text>
            </VStack>

            {/* how it works */}
            <VStack spacing={3} width={"100%"} align={"start"}>
                <Heading as={"h1"} fontSize={"xl"}>How it works?</Heading>
                <Divider />
                <Text color={"textSec"} letterSpacing={'1px'} textAlign={"justify"}>
                    A Minecraft server status checker website works by fetching and displaying information about a Minecraft server in real-time. The website typically has a tool that allows you to enter the server's address or hostname and retrieve information about its current status. This information is usually obtained by sending a request to the server and waiting for a response. The response typically contains information such as the server's version, the number of players currently online, and the maximum number of players the server can accommodate. The website then displays this information for you in a clear and concise manner, making it easy for you to determine if the server is online and available for you to join.
                </Text>
            </VStack>

            {/* bot */}
            <VStack spacing={3} width={"100%"} align={"start"}>
                <Heading as={"h1"} fontSize={"xl"}>Discord bot?</Heading>
                <Divider />
                <Text color={"textSec"} letterSpacing={'1px'} textAlign={"justify"}>
                    With the Minecraft server status  Discord bot, checking the status of your favorite Minecraft servers has never been easier. All you need to do is hop into your Discord channel and type in the <Badge>/status</Badge> command followed by the server's address or hostname. In just a matter of seconds, the bot will fetch all the information about the server's current status for you. You'll be able to see the server version, the number of players online, and the maximum number of players the server can handle and motd. No more switching between different platforms or navigating through complex websites. Just type in the command and get all the information you need, right there in your Discord channel. <Badge>/livecheck</Badge> command updates server online status and player count automatically every 15 seconds and updates the message if changes occur. Stay updated on your favorite Minecraft server in real-time.
                </Text>
            </VStack>

        </VStack>
    )
}