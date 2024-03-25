import Link from "@/layout/global/Link";
import { Button, DarkMode, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import { BiAddToQueue } from "react-icons/bi";
import { TbLayoutDashboard } from "react-icons/tb";

export default function BotInfo() {
	return (
		<Flex
			w="100%"
			flexDir={"column"}
			gap={10}
			pos={"relative"}
			color="whiteAlpha.900"
			py={10}
			bgGradient={`linear(to-r, brand.900, #dc69b4)`}
		>
			<DarkMode>
				<Flex flexDir={"column"} gap={10} mx="auto" w="100%" maxW="1400px" px={4}>
					<Flex flexDir={"column"}>
						<Heading as={"h3"} fontSize={"4xl"}>
							Discord Bot
						</Heading>
						<Text as={"h4"} fontSize={"2xl"}>
							Is Minecraft Server Online Bot
						</Text>
					</Flex>
					<Text color="whiteAlpha.800" fontSize={"lg"} fontWeight={500}>
						Our Discord Bot allows checking the status of any Minecraft server automatically every 30 seconds. It's
						customizable and easy to use via our dashboard. Set up alerts to get notified when your server goes
						offline or online. The bot is free to use and can be added to your server with a single click.
					</Text>

					<HStack>
						<Button size="lg" variant={"brand"} as={Link} to="/dashboard/bot" rightIcon={<TbLayoutDashboard />}>
							Dashboard
						</Button>
						<Button size="lg" rightIcon={<BiAddToQueue />} as={Link} isExternal to="/invite">
							Invite to your server
						</Button>
					</HStack>
				</Flex>
			</DarkMode>
		</Flex>
	);
}
