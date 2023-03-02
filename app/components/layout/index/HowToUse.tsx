import { Badge, Heading, Icon, Stack, Text, VStack } from "@chakra-ui/react";
import { BiMessageError, BiNetworkChart, BiPointer } from "react-icons/bi";

export default function HowToUse() {
	return (
		<VStack spacing={28} width={"100%"} align={"start"} mb={10}>
			{/* how to use */}
			<VStack spacing={5} width={"100%"} align={"start"}>
				<Heading as={"h1"} fontSize={"5xl"} fontWeight={"black"} letterSpacing={"3px"}>
					How to use this tool?
				</Heading>
				<Stack direction={{ base: "column", md: "row" }} spacing={{ base: 5, md: 20 }} alignItems={"center"}>
					<Text color={"textSec"} letterSpacing={"1px"} textAlign={"justify"}>
						Simply enter the server address you want to check in input and click <b>Search</b> button. The fetching
						state shouldn't take more than 5 seconds. After that, you will see the server status, including the server
						version, player count, and maximum player count. If the server is online, you can then click the big
						domain text to view the website in new browser tab. The website may also provide additional information
						about the server, such as a players list, host, software and plugins used. Use this tool to easily check
						the status of your favorite Minecraft servers and quickly join the ones that are online.
					</Text>
					<Icon as={BiPointer} boxSize={"150px"} />
				</Stack>
			</VStack>

			{/* how it works */}
			<VStack spacing={5} width={"100%"} align={"end"}>
				<Heading as={"h1"} fontSize={"5xl"} fontWeight={"black"} textAlign={"end"} letterSpacing={"3px"}>
					How it works?
				</Heading>
				<Stack direction={{ base: "column", md: "row" }} spacing={{ base: 5, md: 20 }} alignItems={"center"}>
					<Icon as={BiNetworkChart} boxSize={"150px"} />
					<Text color={"textSec"} letterSpacing={"1px"} textAlign={"justify"}>
						Real-time information about a Minecraft server is fetched and shown on a website that checks the status of
						servers. Most websites have a feature that lets you enter the hostname or address of the server to get
						information about its current status. The typical method of getting this information is to send a request
						to the server and then wait for a response. The response often includes details on the server's version,
						the total number of players it can support, and the number of people who are online right now. It is then
						simple for you to establish whether the server is active and open for you to join thanks to the website's
						clear and concise display of this information for you.
					</Text>
				</Stack>
			</VStack>

			{/* bot */}
			<VStack spacing={5} width={"100%"} align={"start"}>
				<Heading as={"h1"} fontSize={"5xl"} fontWeight={"black"} textAlign={"end"} letterSpacing={"3px"}>
					Hardly using Discord? We got you covered!
				</Heading>
				<Stack direction={{ base: "column", md: "row" }} spacing={{ base: 5, md: 20 }} alignItems={"center"}>
					<Text color={"textSec"} letterSpacing={"1px"} textAlign={"justify"}>
						With the Minecraft server status Discord bot, checking the status of your favorite Minecraft servers has
						never been easier. All you need to do is hop into your Discord channel and type in the{" "}
						<Badge>/status</Badge> command followed by the server's address or hostname. In just a matter of seconds,
						the bot will fetch all the information about the server's current status for you. You'll be able to see
						the server version, the number of players online, and the maximum number of players the server can handle
						and motd. No more switching between different platforms or navigating through complex websites. Just type
						in the command and get all the information you need, right there in your Discord channel.{" "}
						<Badge>/livecheck</Badge> command updates server online status and player count automatically every 15
						seconds and updates the message if changes occur. Stay updated on your favorite Minecraft server in
						real-time.
					</Text>
					<Icon as={BiMessageError} boxSize={"150px"} />
				</Stack>
			</VStack>
		</VStack>
	);
}
