import { Flex, Heading, Text } from "@chakra-ui/react";
import Link from "@/layout/global/Link";

export default function ApiDocumentation() {
	return (
		<Flex flexDir={"column"} gap={4}>
			<Text>We offer a public API for developers to use. It requires tokens generated from the dashboard.</Text>

			<Flex rounded={"xl"} bg={"alpha"} flexDir={"column"} p={4} gap={2} as={Link} to={"/api/documentation/server-data"}>
				<Heading size={"md"}>Server data API</Heading>
				<Text>Access the data of any server, such as it's status, players, and more.</Text>
			</Flex>

			<Flex rounded={"xl"} bg={"alpha"} flexDir={"column"} p={4} gap={2} as={Link} to={"/api/documentation/voting"}>
				<Heading size={"md"}>Votings API</Heading>
				<Text>Get vote count of your server, overall or some username.</Text>
			</Flex>
		</Flex>
	);
}
