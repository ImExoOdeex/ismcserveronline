import { Button, Text } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import config from "../config/config";
import { getCookieWithoutDocument } from "../utils/functions/cookies";
import useRootData from "../utils/hooks/useRootData";
import { ChakraBox } from "./MotionComponents";

function CookieConsent() {
	const { cookies } = useRootData();

	const name = "cookie-consent";
	const loaderConsent = getCookieWithoutDocument(name, cookies);

	const [isCookieConsent, setIsCookieConsent] = useState(loaderConsent ? true : false);

	function accept() {
		document.cookie = `${name}=true`;
		setIsCookieConsent(true);
	}

	return (
		<AnimatePresence mode="wait">
			{!isCookieConsent && (
				<ChakraBox
					exit={{ scale: 0.9, opacity: 0, transition: { ease: config.ease, duration: 0.3 } }}
					backdropFilter={"blur(20px)"}
					maxW={"400px"}
					display={"flex"}
					pos={"fixed"}
					bottom={5}
					right={5}
					left={{
						base: "5",
						md: "auto"
					}}
					zIndex={100}
					fontWeight={"500"}
					rounded={"lg"}
					border={"1px solid"}
					borderColor={"alpha300"}
					flexDir={"column"}
					p={5}
					gap={4}
				>
					<Text alignItems={"center"}>
						This site uses third-party cookies. If you don't agree using them, you should close this page now.
					</Text>

					<Button onClick={accept} fontStyle={"normal"} variant={"brand"} rounded={"md"} w="100%">
						<Text mx={5}>Accept</Text>
					</Button>
				</ChakraBox>
			)}
		</AnimatePresence>
	);
}
export default CookieConsent;
