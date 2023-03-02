import { VStack, Badge, Link, HStack, Flex, Stack, Icon, Text, Image, Box } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { MdPeople } from "react-icons/md";
import { ChakraBox } from "../MotionComponents";
import DiscordIcon from "../icons/DiscordIcon";
import links from "../../config/links.json";
import { useState } from "react";

export default function BotInfoInside({ opened }: { opened: boolean }) {
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

	return (
		<>
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
						<VStack spacing={10} w="100%" pt={10} align={"center"}>
							<Text maxW={"800px"} mx={"auto"} textAlign={"center"}>
								<Box as={"span"} fontStyle={"italic"}>
									Is Minecraft Server Online
								</Box>{" "}
								is a bot, that allows you to check any Minecraft server status directly on your Discord server.
								Use <Badge>/status</Badge> command and enter the server address to check the status! You can also
								set up the <Badge>/livecheck</Badge> command and see your server status in real-time!
							</Text>

							<Link
								href="https://top.gg/bot/1043569248427061380"
								target="_blank"
								w="100%"
								maxW={"800px"}
								mx="auto"
								p={3}
								rounded={"2xl"}
								border={"3px solid #ff3366"}
								justifyContent={"center"}
								display={"flex"}
								_hover={{ textDecor: "none", bg: "alpha" }}
							>
								<HStack spacing={5}>
									<Image src="/topgg.svg" h={"48px"} />
									<Flex rounded={"full"} w={"3px"} h={"100%"} bg={"#ff3366"} />
									<Text fontWeight={"black"}>Check out our bot on Top.gg</Text>
								</HStack>
							</Link>

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

								<VStack w="100%" align={"start"} spacing={5}>
									{/* bot */}
									<ChakraBox
										w="100%"
										h="50%"
										variants={variants}
										animate={activeBlock == 0 ? "open" : activeBlock == 1 ? "open1" : "closed"}
										onMouseEnter={() => setActiveBlock(0)}
										onMouseLeave={() => setActiveBlock(null)}
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
											href={links.discordBotInvite}
										>
											<DiscordIcon boxSize={"48px"} />
											<Text fontWeight={700} color={"white"} textAlign={"center"}>
												Invite our bot to your server to check Server status directly in discord!
											</Text>
											links.discordServerInvite
										</Stack>
									</ChakraBox>

									{/* server */}
									<ChakraBox
										w="100%"
										h="50%"
										variants={variants}
										animate={activeBlock == 1 ? "open" : activeBlock == 0 ? "open1" : "closed"}
										onMouseEnter={() => setActiveBlock(1)}
										onMouseLeave={() => setActiveBlock(null)}
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
											href={links.discordServerInvite}
										>
											<Icon as={MdPeople} color={"white"} boxSize={"48px"} />
											<Text fontWeight={700} color={"white"} textAlign={"center"}>
												Join our server if you need any help or just want to talk!
											</Text>
										</Stack>
									</ChakraBox>
								</VStack>
							</Stack>
						</VStack>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
