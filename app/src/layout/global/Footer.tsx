import { getCookie, getCookieWithoutDocument } from "@/functions/cookies";
import useRootData from "@/hooks/useRootData";
import { ClientStyleContext } from "@/utils/ClientContext";
import { Box, Link as ChakraLink, Flex, HStack, Stack, Text, Tooltip, VStack } from "@chakra-ui/react";
import { useCallback, useContext, useMemo, useState } from "react";
import Link from "./Link";

export default function Footer() {
	const name = "tracking";
	const { cookies, timings, version, repoVersion } = useRootData();

	const [cookieState, setCookieState] = useState<"track" | "no-track">(
		getCookieWithoutDocument(name, cookies) == "no-track" ? "no-track" : "track"
	);

	const clientContext = useContext(ClientStyleContext);

	const requestStartToHydration = useMemo(() => {
		return (clientContext ? clientContext.hydrationTime : Date.now()) - timings.start;
	}, [timings.start]);

	const toggleTracking = useCallback(() => {
		const cookie = getCookie(name);
		if (cookie == "track" || !cookie) {
			document.cookie = `${name}=no-track`;
			setCookieState("no-track");
		} else {
			document.cookie = `${name}=track`;
			setCookieState("track");
		}
	}, []);

	return (
		<Box h={"auto"} as="footer" mt={10}>
			<Stack
				py={{ base: 10, md: "unset" }}
				rounded={"3xl"}
				mb={10}
				mt={15}
				spacing={[7, 10, 20]}
				direction={{ base: "column", md: "row" }}
				justifyContent={"center"}
				maxW="800px"
				alignItems={{ base: "center", md: "start" }}
				mx="auto"
			>
				<Box>
					<VStack align={{ base: "center", md: "start" }}>
						<Flex flexDir={"row"}>
							<Text fontWeight={"bold"} fontSize="18px" fontStyle="">
								ismcserver
								<Box as="span" color={"green"}>
									.online
								</Box>
							</Text>
							<Text fontSize={"xs"} fontWeight={600} alignSelf={"end"} mb={1} ml={1.5}>
								{version}
							</Text>
						</Flex>
						<Text color={"textSec"} fontWeight="600">
							This site is{" "}
							<ChakraLink
								href="https://github.com/ImExoOdeex/ismcserveronline"
								target="_blank"
								textDecor={"underline"}
								variant={"link"}
							>
								open source
							</ChakraLink>{" "}
						</Text>
						<Text color={"textSec"} fontWeight={600}>
							Made with {`<3`} by{" "}
							<ChakraLink
								target="_blank"
								textDecor={"underline"}
								variant={"link"}
								href="https://github.com/ImExoOdeex/"
							>
								imexoodeex
							</ChakraLink>
						</Text>
					</VStack>
				</Box>

				<Stack direction={"row"} spacing={{ base: "70px", md: 20 }}>
					<VStack align={"start"} fontWeight="600">
						<Text fontWeight="700">Availability</Text>
						<Text
							color={"textSec"}
							tabIndex={0}
							onClick={toggleTracking}
							transition={"color .2s"}
							_hover={{ color: "text" }}
							cursor="pointer"
							userSelect={"none"}
						>
							Turn tracking {cookieState === "no-track" ? "on" : "off"}
						</Text>
						<Text
							color={"textSec"}
							transition={"color .2s"}
							_hover={{ color: "text" }}
							cursor="pointer"
							onClick={() => window.scrollTo(0, 0)}
							userSelect={"none"}
						>
							Go to the top
						</Text>
					</VStack>

					<VStack align={"start"} fontWeight="600">
						<HStack w="100%" justifyContent={"space-between"}>
							<Text fontWeight="700">Other</Text>
							<HStack>
								{/* <Tooltip label="Time server took to handle request" hasArrow>
									<Text fontWeight="500" fontSize={"xs"}>
										{timings.requestHandledIn}ms
									</Text>
								</Tooltip> */}
								<Tooltip label="Time from request start to client hydration" hasArrow>
									<Text fontWeight="500" fontSize={"xs"}>
										{requestStartToHydration}ms
									</Text>
								</Tooltip>
							</HStack>
						</HStack>
						<Text color={"textSec"}>
							<ChakraLink
								transition={"color .2s"}
								_hover={{ color: "text", textDecor: "none" }}
								as={Link}
								prefetch="intent"
								to={"/tos"}
							>
								Terms of service
							</ChakraLink>
						</Text>
						<Text color={"textSec"} fontWeight="600">
							Copyright © {new Date().getFullYear()}
						</Text>
					</VStack>
				</Stack>
			</Stack>
		</Box>
	);
}
