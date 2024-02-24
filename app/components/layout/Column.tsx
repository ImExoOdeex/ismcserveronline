import { Flex } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { memo, useEffect, useState } from "react";
import { Ad, adType } from "../ads/Yes";

interface Props {
	side: "left" | "right";
}

export default memo(function Column({ side }: Props) {
	const path = useLocation().pathname;

	const [windowWidth, setWindowWidth] = useState<number | null>(null);

	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	if (!windowWidth) return null;
	const columnWidth = windowWidth * 0.15;
	return (
		<Flex
			w={"100%"}
			maxW={columnWidth}
			justifyContent={"center"}
			alignItems={"center"}
			h="100%"
			display={{ base: "none", "2xl": "flex" }}
			pos="absolute"
			top={0}
			left={side === "left" ? 0 : "unset"}
			right={side === "right" ? 0 : "unset"}
		>
			<Ad key={path} type={adType.responsive} w={columnWidth} />
		</Flex>
	);
});
