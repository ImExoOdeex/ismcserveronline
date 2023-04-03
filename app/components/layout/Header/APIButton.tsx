import { Button, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { BiCode } from "react-icons/bi";
import Link from "~/components/utils/Link";

export default function APIButton() {
	return (
		<Link to="/api" _hover={{ textDecor: "none" }} transform={"auto-gpu"} _active={{ scale: 0.9 }} prefetch="render">
			<Button _hover={{ bg: "alpha" }} _active={{ bg: "alpha100" }} rounded={"xl"} bg={"transparent"} tabIndex={-1}>
				<Flex flexDir={"row"}>
					<HStack spacing={2}>
						<Text fontWeight={600}>API</Text>
						<Icon as={BiCode} />
					</HStack>
				</Flex>
			</Button>
		</Link>
	);
}
