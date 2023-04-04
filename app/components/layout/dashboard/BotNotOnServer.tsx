import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, HStack, Heading, Image, Text, VStack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";

export default function BotNotOnServer() {
	return (
		<VStack w="100%" spacing={5}>
			<Image boxSize={"60"} alt="crying wumpus" src="/wumpussad.gif" />
			<Heading fontSize={"3xl"}>Sadly, our bot is not on this server.</Heading>
			<Button as={Link} prefetch="render" to="/dashboard" _hover={{ textDecor: "none", bg: "alpha100" }} bg="alpha200">
				<HStack>
					<ArrowBackIcon />
					<Text>Go back to dashboard</Text>
				</HStack>
			</Button>
		</VStack>
	);
}
