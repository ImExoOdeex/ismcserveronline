import { getFullFileUrl } from "@/functions/storage";
import useGlobalContext from "@/hooks/useGlobalContext";
import useUser from "@/hooks/useUser";
import config from "@/utils/config";
import { Flex, Image, useColorMode, useToken } from "@chakra-ui/react";
import { useLocation, useMatches } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";

export default memo(function BackgroundUtils() {
	const { displayGradient, displayLogoInBg, gradientColor } = useGlobalContext();

	const { colorMode } = useColorMode();
	const user = useUser();
	const [rawColor] = useToken("colors", [gradientColor ?? ""]);
	const path = useLocation().pathname;
	const isVote = path.split("/").pop() === "vote";

	const serverLoaderData = useMatches()[1].data as any;
	const backgroundUrl = serverLoaderData?.[isVote ? "data" : "foundServer"]?.background
		? getFullFileUrl(serverLoaderData?.[isVote ? "data" : "foundServer"]?.background)
		: null;

	return (
		<Flex pos={"absolute"} zIndex={-1} maxH={"100vh"} w="100%" h="100%">
			{/* Avatar */}
			<AnimatePresence mode="wait" initial={false}>
				{displayLogoInBg && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							ease: config.ease,
							duration: 0.25
						}}
					>
						<Image
							pos={"absolute"}
							top={0}
							left={0}
							opacity={0.1}
							src={user?.photo ?? "/discordLogo.png"}
							filter={"blur(25px)"}
							w={"100%"}
							h={"80vh"}
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

			{/* Background */}
			<AnimatePresence mode="wait" initial={false}>
				{backgroundUrl && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							ease: config.ease,
							duration: 0.25
						}}
					>
						<Image
							pos={"absolute"}
							top={0}
							left={0}
							opacity={0.1}
							src={backgroundUrl}
							w={"100%"}
							h={"90vh"}
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

			{displayGradient && !backgroundUrl && (
				<>
					<svg
						style={{ width: "100%", opacity: colorMode === "light" ? (gradientColor === "gold" ? 0.2 : 0.25) : 0.2 }}
					>
						<defs>
							<linearGradient id="background-gradient" gradientTransform="rotate(70)">
								<stop offset="0%" stopColor={rawColor} style={{ transition: "stop-color 0.4s ease 0s" }}></stop>
								<stop offset="100%" stopColor="transparent"></stop>
							</linearGradient>
						</defs>
						<rect fill="url('#background-gradient')" width="100%" height="100%"></rect>
					</svg>

					<svg
						style={{ width: "100%", opacity: colorMode === "light" ? (gradientColor === "gold" ? 0.2 : 0.25) : 0.2 }}
					>
						<defs>
							<linearGradient
								id="background-gradient2"
								gradientTransform="rotate(70)"
								gradientUnits="objectBoundingBox"
							>
								<stop offset="0%" stopColor={rawColor} style={{ transition: "stop-color 0.4s ease 0s" }}></stop>
								<stop offset="100%" stopColor="transparent"></stop>
							</linearGradient>
						</defs>
						<rect
							fill="url('#background-gradient2')"
							width="100%"
							height="100%"
							// mirror in x
							transform="scale(-1, 1)"
							transform-origin="center"
						></rect>
					</svg>
				</>
			)}
		</Flex>
	);
});
