import { Flex, Heading } from "@chakra-ui/react";
import { Outlet } from "@remix-run/react";

export default function ApiDocumentation() {
	return (
		<Flex>
			<Heading>API Documentation</Heading>

			<Outlet />
		</Flex>
	);
}
