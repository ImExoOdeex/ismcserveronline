import {
	Button,
	Link as ChakraLink,
	Flex,
	HStack,
	Heading,
	Icon,
	Image,
	Stack,
	Text,
	VStack,
	Wrap,
	WrapItem
} from "@chakra-ui/react";
import { AiOutlineDashboard } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from "~/components/utils/Link";
import links from "../../config/config";
import DiscordIcon from "../icons/DiscordIcon";

export default function BotInfo() {
	return (
		<VStack w="100%" align={"start"} spacing={10} pos={"relative"}>
			<Stack
				justifyContent={"space-between"}
				w="100%"
				direction={{ base: "column", md: "row" }}
				align={{ base: "start", md: "center" }}
			>
				<VStack align={"start"}>
					<Heading as={"h3"} fontSize={"4xl"}>
						Discord bot
					</Heading>
					<Heading as={"h4"} fontSize={"2xl"}>
						Is Minecraft Server Online bot
					</Heading>
				</VStack>

				<Wrap>
					<WrapItem>
						<Button
							as={ChakraLink}
							href={links.discordServerInvite}
							target="_blank"
							bg="alpha100"
							fontWeight={500}
							rounded={"xl"}
							alignItems={"center"}
							transform={"auto-gpu"}
							_hover={{ textDecoration: "none", bg: "alpha200" }}
							_active={{ scale: 0.9, bg: "alpha200" }}
							variant={"solid"}
						>
							<HStack>
								<Icon as={BsFillPeopleFill} />
								<Text>Need help?</Text>
							</HStack>
						</Button>
					</WrapItem>
					<WrapItem>
						<Button
							as={ChakraLink}
							href={links.discordBotInvite}
							target="_blank"
							fontWeight={500}
							bg="discord.100"
							rounded={"xl"}
							color={"white"}
							alignItems={"center"}
							_active={{ scale: 0.9 }}
							transform={"auto-gpu"}
							_hover={{ textDecoration: "none", bg: "discord.900" }}
						>
							<HStack>
								<DiscordIcon />
								<Text>Invite</Text>
							</HStack>
						</Button>
					</WrapItem>
					<WrapItem>
						<Button variant={"brand"} as={Link} to="/dashboard" transform={"auto-gpu"} _active={{ scale: 0.9 }}>
							<HStack>
								<Icon as={AiOutlineDashboard} />
								<Text>Web dashboard</Text>
							</HStack>
						</Button>
					</WrapItem>
					<WrapItem>
						<Button
							as={ChakraLink}
							href={"https://top.gg/bot/1043569248427061380/vote"}
							target="_blank"
							fontWeight={500}
							rounded={"xl"}
							alignItems={"center"}
							transform={"auto-gpu"}
							color={"white"}
							bg="#ff3366"
							_hover={{ textDecoration: "none", bg: "#c71c47" }}
							_active={{ scale: 0.9, bg: "#ae193e" }}
						>
							<HStack>
								<Image src="/topgg.svg" fill={"white"} h="19px" alt="top.gg logo" />
								<Text>Vote</Text>
							</HStack>
						</Button>
					</WrapItem>
				</Wrap>
			</Stack>

			<Stack direction={{ base: "column", md: "row" }} w="100%" spacing={10}>
				<VStack align={"start"} w="100%" spacing={5}>
					<Heading as={"h3"} fontSize={"2xl"}>
						What is it?
					</Heading>
					<Text>
						Is Minecraft Server Online bot is a Discord bot, which allows you to check any Minecraft server status
						directly on Discord! It also allows you to enable livecheck and it will check your server status every 15
						seconds completely for free!
					</Text>

					<Heading as={"h3"} fontSize={"2xl"}>
						How to use it?
					</Heading>
					<Text>
						To use the bot, you need to invite it to your server. You can do it by clicking the "Invite" button above.
						After that, you can use the bot by using the <code>/slash commands</code>. You can also use the web
						dashboard by clicking the "Web dashboard" button above.
					</Text>
				</VStack>

				<Image
					src="/webp/statusbotlogo512.webp"
					alt="Is Minecraft Server Online bot logo"
					boxSize={"300px"}
					rounded={"2xl"}
				/>
			</Stack>

			<Flex
				zIndex={-1}
				pos={"absolute"}
				top={0}
				right={0}
				left={0}
				bottom={0}
				sx={{ WebkitMaskImage: "linear-gradient(to right, transparent 2%, black 100%)" }}
				opacity={0.1}
			>
				<DiscordIcon fill={"currentcolor"} w="100%" h="100%" scale={0.7} transform={"auto-gpu"} />
			</Flex>
		</VStack>
	);
}
