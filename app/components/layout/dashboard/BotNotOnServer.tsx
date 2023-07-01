import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Heading, Image, Link as ChakraLink, Stack, VStack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";
import links from "../../config/links.json";
import DiscordIcon from "../icons/DiscordIcon";

export default function BotNotOnServer() {
	return (
		<VStack w="100%" spacing={5}>
			<Image boxSize={"60"} alt="crying wumpus" src="/wumpussad.gif" />
			<Heading fontSize={"3xl"}>Sadly, our bot is not on this server.</Heading>
			<Stack
				direction={{
					base: "column",
					md: "row"
				}}
			>
				<Button
					as={Link}
					prefetch="render"
					to="/dashboard"
					_hover={{ textDecor: "none", bg: "alpha100" }}
					bg="alpha200"
					leftIcon={<ArrowBackIcon />}
				>
					Go back to dashboard
				</Button>
				<Button
					as={ChakraLink}
					target="_blank"
					href={links.discordBotInvite}
					_hover={{ textDecor: "none" }}
					variant="brand"
					leftIcon={<DiscordIcon />}
				>
					Add the bot to your server
				</Button>
			</Stack>
		</VStack>
	);
}
