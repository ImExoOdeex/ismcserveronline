import { Flex } from "@chakra-ui/react";
import { Ad, adType } from "../ads/Ad";

export default function Column() {
	const columnWidth = (1920 - 1200) * 0.5 - 8;

	return (
		<Flex
			mt={"80px"}
			w={{ xl: columnWidth * 0.75, "2xl": columnWidth }}
			maxW={{ xl: columnWidth * 0.75, "2xl": columnWidth }}
			minW={{ xl: columnWidth * 0.75, "2xl": columnWidth }}
			justifyContent={"center"}
			alignItems={"center"}
			h="100%"
			display={{ base: "none", "2xl": "flex" }}
		>
			<Flex w="75%" mx={"auto"} justifyContent={"center"} alignItems={"center"} h="100%">
				<Ad width={columnWidth <= 1920 ? "240px" : ""} type={adType.column} />
			</Flex>
		</Flex>
	);
}
