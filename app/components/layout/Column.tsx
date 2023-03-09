import { Flex } from "@chakra-ui/react";
import { Ad, adType } from "../ads/Ad";
import { useState, useEffect } from "react";
import { useTransition } from "@remix-run/react";

export default function Column() {
	const [width, setWidth] = useState<number>();

	useEffect(() => {
		setWidth(window.innerWidth);
	}, []);

	const columnWidth = ((width ?? 1920) - 1200) * 0.5;

	const isLoading = useTransition().state === "loading";

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
				{!isLoading && <Ad width={columnWidth <= 1920 ? "240px" : ""} type={adType.column} />}
			</Flex>
		</Flex>
	);
}
