import {
	Badge,
	Box,
	Flex,
	Heading,
	Icon,
	Image,
	Link,
	Stack,
	Text,
	VStack
} from "@chakra-ui/react";
import { ChakraBox } from "../MotionComponents";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdPeople } from "react-icons/md";
import links from "../../config/links.json";
import DiscordIcon from "../icons/DiscordIcon";

export default function BotInfo() {
	const [activeBlock, setActiveBlock] = useState<number | null>();

	const variants = {
		open: {
			height: "70%"
		},
		open1: {
			height: "30%"
		},
		closed: {
			height: "50%"
		}
	};

	const [opened, setOpened] = useState<boolean>(false);

	return (
		<VStack w="100%" align={"start"} my={20} spacing={20}>
			<VStack w="100%" align={"start"} spacing={5}>
				<Flex
					p={5}
					rounded={"2xl"}
					bg={"alpha"}
					w="100%"
					flexDir={"column"}
					onClick={() => setOpened(!opened)}
					userSelect={"none"}
					cursor={opened ? "initial" : "pointer"}
					_hover={{ bg: opened ? "" : "alpha100" }}
					_active={{ bg: opened ? "" : "alpha200" }}
					transition={".1s"}
				>
					<VStack align={"start"} spacing={0} pos={"relative"}>
						<Text fontSize={"xs"}>Add our discord bot!</Text>
						<Heading as={"h1"} fontSize={"lg"}>
							Is Minecraft Server Online bot
						</Heading>
						<Text
							fontSize={"10px"}
							pos={"absolute"}
							bottom={{ base: -3, sm: -2 }}
							right={0}
						>
							Read {opened ? "less" : "more"}
						</Text>
					</VStack>

					<AnimatePresence initial={false} mode="wait">
						{opened && (
							<motion.div
								variants={{
									open: { height: "auto" },
									closed: { height: 0 }
								}}
								initial={"closed"}
								animate={"open"}
								exit={"closed"}
								transition={{ ease: [0.25, 0.1, 0.25, 1] }}
								style={{ height: "auto", overflow: "hidden" }}
							>
								<VStack
									spacing={10}
									w="100%"
									pt={10}
									align={"center"}
								>
									<Text
										maxW={"800px"}
										mx={"auto"}
										textAlign={"center"}
									>
										<Box as={"span"} fontStyle={"italic"}>
											Is Minecraft Server Online
										</Box>{" "}
										is a bot, that allows you to check any
										Minecraft server status directly on your
										Discord server. Use{" "}
										<Badge>/status</Badge> command and enter
										the server address to check the status!
										You can also set up the{" "}
										<Badge>/livecheck</Badge> command and
										see your server status in real-time!
									</Text>

									<Text
										fontWeight={"black"}
										textAlign={"center"}
									>
										See it on{" "}
										<Link
											href="https://top.gg/bot/1043569248427061380"
											target="_blank"
											color={"#ff3366"}
										>
											Top.gg
										</Link>
										!
									</Text>

									<Stack
										w="100%"
										maxW={"1200px"}
										mx="auto"
										spacing={5}
										pos={"relative"}
										direction={{
											base: "column",
											md: "row"
										}}
									>
										<Image
											src="/webp/statusbotlogo512.webp"
											rounded={"2xl"}
											h="300px"
											boxShadow={"md"}
											border="2px solid white"
										/>

										<VStack
											w="100%"
											align={"start"}
											spacing={5}
										>
											{/* bot */}
											<ChakraBox
												w="100%"
												h="50%"
												variants={variants}
												animate={
													activeBlock == 0
														? "open"
														: activeBlock == 1
														? "open1"
														: "closed"
												}
												onMouseEnter={() =>
													setActiveBlock(0)
												}
												onMouseLeave={() =>
													setActiveBlock(null)
												}
											>
												<Stack
													w="100%"
													py={{ base: 5, sm: 3 }}
													px={3}
													h="100%"
													alignItems={"center"}
													justifyContent={"center"}
													boxShadow={"lg"}
													transition={".2s"}
													direction={{
														base: "column",
														sm: "row"
													}}
													spacing={5}
													rounded={"2xl"}
													bg="discord.100"
													_hover={{
														bg: "discord.900",
														textDecor: "none",
														scale: 0.975
													}}
													transform={"auto-gpu"}
													_active={{ scale: 0.95 }}
													as={Link}
													href={
														links.discordBotInvite
													}
												>
													<DiscordIcon
														boxSize={"48px"}
													/>
													<Text
														fontWeight={700}
														color={"white"}
														textAlign={"center"}
													>
														Invite our bot to your
														server to check Server
														status directly in
														discord!
													</Text>
													links.discordServerInvite
												</Stack>
											</ChakraBox>

											{/* server */}
											<ChakraBox
												w="100%"
												h="50%"
												variants={variants}
												animate={
													activeBlock == 1
														? "open"
														: activeBlock == 0
														? "open1"
														: "closed"
												}
												onMouseEnter={() =>
													setActiveBlock(1)
												}
												onMouseLeave={() =>
													setActiveBlock(null)
												}
											>
												<Stack
													w="100%"
													py={{ base: 5, sm: 3 }}
													px={3}
													h="100%"
													alignItems={"center"}
													justifyContent={"center"}
													boxShadow={"lg"}
													transition={".2s"}
													direction={{
														base: "column",
														sm: "row"
													}}
													spacing={5}
													rounded={"2xl"}
													bg="discord.900"
													_hover={{
														bg: "discord.100",
														textDecor: "none",
														scale: 0.975
													}}
													transform={"auto-gpu"}
													_active={{ scale: 0.95 }}
													as={Link}
													href={
														links.discordServerInvite
													}
												>
													<Icon
														as={MdPeople}
														color={"white"}
														boxSize={"48px"}
													/>
													<Text
														fontWeight={700}
														color={"white"}
														textAlign={"center"}
													>
														Join our server if you
														need any help or just
														want to talk!
													</Text>
												</Stack>
											</ChakraBox>
										</VStack>
									</Stack>
								</VStack>
							</motion.div>
						)}
					</AnimatePresence>
				</Flex>
			</VStack>
		</VStack>
	);
}
