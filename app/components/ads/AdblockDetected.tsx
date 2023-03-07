import { Icon, Stack, Text } from "@chakra-ui/react";
import { BiCheckShield } from "react-icons/bi";

export default function AdblockDetected() {
	return (
		<Stack
			direction={{ base: "column", sm: "row" }}
			bg={"rgba(194, 57, 82, 0.2)"}
			justifyContent={"center"}
			w="100%"
			alignItems={"center"}
			py={2}
			px={2}
			boxShadow={"-2px 0px 0px 5px rgba(194, 57, 82, 0.2)"}
		>
			<Icon as={BiCheckShield} boxSize={8} />
			<Text fontWeight={"semibold"} textAlign={"center"}>
				It looks like you're using adblock. Please consider disabling it, to support us for free!
			</Text>
		</Stack>
	);
}
