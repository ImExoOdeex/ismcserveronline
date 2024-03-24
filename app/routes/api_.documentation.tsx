import { Flex, Heading } from "@chakra-ui/react";
import { Outlet } from "@remix-run/react";

export default function Api_Documentation() {
	return (
		<Flex flexDir={"column"} maxW={"1200px"} mx={"auto"} w={"100%"} px={4} mt={16} gap={6}>
			<Heading size={"lg"}>API Documentation</Heading>

			<Outlet />
		</Flex>
	);
}
