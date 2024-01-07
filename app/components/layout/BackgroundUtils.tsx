import { Flex, Image, useColorMode, useToken } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { context } from "../utils/GlobalContext";
import useUser from "../utils/hooks/useUser";

export default function BackgroundUtils() {
	const { displayGradient, displayLogoInBg, gradientColor } = useContext(context);

	const { colorMode } = useColorMode();
	const user = useUser();
	const [rawColor] = useToken("colors", [gradientColor ?? ""]);

	return (
		<Flex pos={"absolute"} zIndex={-1} maxH={"100vh"} w="100%" h="100%">
			<AnimatePresence mode="wait" initial={false}>
				{displayLogoInBg && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							ease: [0.25, 0.1, 0.25, 1],
							duration: 0.75
						}}
					>
						<Image
							pos={"absolute"}
							top={0}
							left={0}
							opacity={0.1}
							src={user?.photo ?? "/discordLogo.png"}
							filter={"blur(20px)"}
							w={"100%"}
							h={"100vh"}
							zIndex={-1}
							objectFit={"cover"}
							objectPosition={"center"}
							sx={{
								WebkitMaskImage: `linear-gradient(to top, transparent 2%, black 50%)`
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
			{displayGradient && (
				<svg style={{ width: "100%", opacity: colorMode === "light" ? (gradientColor === "gold" ? 0.2 : 0.25) : 0.2 }}>
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
