import { HStack, Stack, Text, Link as ChakraLink } from "@chakra-ui/react";
import pack from "../../../package.json";
import Link from "../utils/Link";

export default function Footer() {
	return (
		<Stack
			__css={{ clear: "both" }}
			direction={{ base: "column", md: "row" }}
			mx="auto"
			w="100%"
			maxW={"1200px"}
			justifyContent={"space-between"}
			as={"footer"}
			fontWeight={"normal"}
			my={2}
			px={4}
			letterSpacing={"1px"}
			fontSize={"sm"}
		>
			<HStack>
				<Text>
					version {pack.version} |{" "}
					<Link to={"/tos"}>Terms of service</Link>
				</Text>
			</HStack>
			<HStack>
				<Text>
					Made with {`<3`} by{" "}
					<ChakraLink
						href="https://github.com/ImExoOdeex/"
						target="_blank"
					>
						imexoodeex
					</ChakraLink>
				</Text>
			</HStack>
		</Stack>
	);
}
