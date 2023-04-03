import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Button, HStack, Text } from "@chakra-ui/react";
import Link from "~/components/utils/Link";

export default function FAQButton() {
	return (
		<Link to={"/faq"} _hover={{ textDecor: "none" }} transform={"auto-gpu"} _active={{ scale: 0.9 }} prefetch="render">
			<Button _hover={{ bg: "alpha" }} _active={{ bg: "alpha100" }} rounded={"xl"} bg={"transparent"} tabIndex={-1}>
				<HStack spacing={2}>
					<Text fontWeight={600}>FAQ</Text>
					<QuestionOutlineIcon />
				</HStack>
			</Button>
		</Link>
	);
}
