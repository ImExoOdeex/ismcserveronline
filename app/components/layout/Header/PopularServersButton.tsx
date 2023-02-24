import { Button, HStack, Icon, Text } from "@chakra-ui/react";
import { BiLineChart } from "react-icons/bi";
import Link from "~/components/utils/Link";

export default function PopularServersButton() {
	return (
		<Link
			to={"/popular-servers"}
			_hover={{ textDecor: "none" }}
			transform={"auto-gpu"}
			_active={{ scale: 0.9 }}
		>
			<Button
				_hover={{ bg: "alpha" }}
				_active={{ bg: "alpha100" }}
				rounded={"xl"}
				bg={"transparent"}
				tabIndex={-1}
			>
				<HStack spacing={2}>
					<Text fontWeight={600}>Popular servers</Text>
					<Icon as={BiLineChart} />
				</HStack>
			</Button>
		</Link>
	);
}