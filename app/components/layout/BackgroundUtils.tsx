import { Flex, Image, useColorMode, useToken } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { useContext } from "react";
import { context } from "../utils/GlobalContext";
import { AnimatePresence, motion } from "framer-motion";

export default function BackgroundUtils() {
	const { displayGradient, displayLogoInBg, gradientColor } = useContext(context);

	const { colorMode } = useColorMode();
	const path = useLocation().pathname;
	const [rawColor] = useToken("colors", [gradientColor ?? ""]);

	return (
		<Flex pos={"absolute"} zIndex={-1} maxH={"100vh"} w="100%" h="100%">
			<AnimatePresence mode="sync">
				{displayLogoInBg && path === "/" && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ ease: [0.25, 0.1, 0.25, 1] }}
					>
						<Image
							pos={"fixed"}
							top={0}
							right={0}
							left={0}
							bottom={0}
							w="100%"
							h="100%"
							objectFit={"cover"}
							objectPosition={"center"}
							opacity={0.1}
							sx={{ WebkitMaskImage: "linear-gradient(to right, transparent 2%, black 100%)" }}
							src="https://cdn.ismcserver.online/statuswallpaper-trans-720.webp"
						/>
					</motion.div>
				)}
			</AnimatePresence>
			{displayGradient && (
				<svg style={{ width: "100%", opacity: colorMode === "light" ? (gradientColor === "gold" ? 0.2 : 0.2) : 0.15 }}>
					<defs>
						<linearGradient id="background-gradient" gradientTransform="rotate(90)">
							<stop offset="0%" stopColor={rawColor} style={{ transition: "stop-color 0.4s ease 0s" }}></stop>
							<stop offset="100%" stopColor="transparent"></stop>
						</linearGradient>
					</defs>
					<rect fill="url('#background-gradient')" width="100%" height="100%"></rect>
				</svg>
			)}
		</Flex>
	);
}
