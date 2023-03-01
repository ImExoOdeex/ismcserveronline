import { Flex, useColorMode } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { useContext, useLayoutEffect } from "react";
import { context } from "../utils/GlobalContext";
// import { context } from "~/root";

export default function BackgroundUtils() {
	const { displayGradient, displayLogoInBg, gradientColor, updateData } = useContext(context);

	const { colorMode } = useColorMode();
	const path = useLocation().pathname;

	function getNewGradientColor() {
		return path === "/api" ? "green.500" : path === "/popular-servers" ? "orange.200" : "brand";
	}

	useLayoutEffect(() => {
		updateData("gradientColor", getNewGradientColor());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path]);

	return (
		<Flex pos={"absolute"} zIndex={-1} maxH={"100vh"} w="100%" h="100%">
			{displayGradient && (
				<Flex
					w="100%"
					bgGradient={`linear(to-b, ${gradientColor}, transparent)`}
					h="100%"
					opacity={colorMode === "light" ? 0.15 : 0.1}
				/>
			)}
		</Flex>
	);
}
