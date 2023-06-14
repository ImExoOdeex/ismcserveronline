import { Button, Flex, FormLabel, HStack, Input, Spinner, Text, Tooltip, VisuallyHiddenInput, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { VersionChangeComp } from "./VersionChangeComp";

type Props = {
	bedrockChecked: boolean;
	setBedrockChecked: (v: boolean) => void;
	serverValue: string;
	setServerValue: (v: string) => void;
	loaderQuery: boolean;
};

export default function ServerSearch({ bedrockChecked, serverValue, setBedrockChecked, setServerValue, loaderQuery }: Props) {
	const fetcher = useFetcher();

	const [query, setQuery] = useState<boolean>(loaderQuery);

	const initial = useRef(true);

	useEffect(() => {
		if (initial.current) {
			initial.current = false;
			return;
		}
		document.cookie = `bedrock=${bedrockChecked}`;
	}, [bedrockChecked]);

	useEffect(() => {
		if (initial.current) {
			initial.current = false;
			return;
		}
		document.cookie = `query=${query ? "true" : "false"}`;
	}, [query]);

	const submitting = fetcher.state !== "idle";

	return (
		<>
			<fetcher.Form style={{ width: "100%" }} method="post">
				<Flex w="100%" flexDir={"column"} minH="115px" h="100%" minW={"100%"}>
					<FormLabel ml="14px" fontSize={"14px"} color={fetcher?.data ? "red" : "textSec"} fontWeight={400} mb={1.5}>
						{fetcher?.data ? fetcher.data?.error : "Which server do you wanna check?"}
					</FormLabel>

					<Flex pos={"relative"} w={{ base: "100%", sm: "75%" }} flexDir="row" minH={"80px"} h="100%">
						<AnimatePresence initial={false} mode="wait">
							{!submitting && (
								<motion.div
									style={{ width: "100%", zIndex: 0 }}
									transition={{
										duration: 0.25,
										ease: [0.25, 0.1, 0.25, 1]
									}}
									initial={{ opacity: 0, y: "25%" }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: "25%" }}
								>
									<Flex flexDir={"column"} w="100%" gap={2}>
										<Flex alignItems={"center"} flexDir={"row"} gap={2} borderBottomRadius={"2xl"} w="100%">
											<Input
												variant={"filled"}
												placeholder="Hypixel.net"
												name="server"
												pl="14px"
												w="100%"
												border={"none"}
												rounded={"xl"}
												maxW={"340px"}
												onChange={(e) => setServerValue(e.currentTarget.value)}
												value={serverValue}
												bg="alpha"
												color="textSec"
												fontWeight={500}
												_focus={{
													outlineWidth: "2px",
													outlineColor: "text",
													outlineOffset: "-2px",
													border: 0
												}}
												outline={"none"}
												h={"40px"}
											/>

											<Tooltip
												hasArrow
												label={`Please Enter valid server address`}
												isDisabled={serverValue?.includes(".")}
											>
												<Button
													variant="brand"
													type="submit"
													w="35%"
													isDisabled={!serverValue?.includes(".")}
													minW="115px"
												>
													<Text px={2}>Search</Text>
												</Button>
											</Tooltip>
										</Flex>

										<Flex
											alignItems={"center"}
											flexDir={"row"}
											gap={2}
											borderBottomRadius={"2xl"}
											h="40px"
											outlineOffset={"2px"}
											outlineColor={"inv"}
											w="100%"
										>
											<HStack w="100%" maxW={"340px"} h="100%" bg="alpha" rounded={"2xl"}>
												<Button
													w="50%"
													variant={"unstyled"}
													h="100%"
													pos={"relative"}
													onClick={() => setBedrockChecked(false)}
												>
													<Text
														zIndex={4}
														color={bedrockChecked ? "text" : "inv"}
														transition={"color .15s"}
													>
														Java
													</Text>
													{!bedrockChecked && <VersionChangeComp />}
												</Button>
												<Button
													w="50%"
													variant={"unstyled"}
													h="100%"
													pos={"relative"}
													onClick={() => setBedrockChecked(true)}
												>
													<Text
														zIndex={4}
														color={bedrockChecked ? "inv" : "text"}
														transition={"color .15s"}
													>
														Bedrock
													</Text>
													{bedrockChecked && <VersionChangeComp />}
												</Button>
											</HStack>

											<Button
												variant={"solid"}
												h="100%"
												onClick={() => setQuery(!query)}
												bg={query ? "green.600" : "alpha"}
												color={query ? "white" : "text"}
												w="35%"
												_hover={{
													bg: query ? "green.700" : "alpha100"
												}}
												_active={{
													bg: query ? "green.800" : "alpha200"
												}}
												minW="115px"
												isDisabled={bedrockChecked}
											>
												Use Query
											</Button>

											<VisuallyHiddenInput name="query" value={query ? "true" : "false"} />
										</Flex>
									</Flex>
								</motion.div>
							)}
						</AnimatePresence>

						<AnimatePresence mode="wait">
							{submitting && (
								<motion.div
									style={{
										width: "100%",
										position: "absolute",
										top: 0,
										right: 0,
										bottom: 0,
										left: 0,
										zIndex: 1
									}}
									transition={{
										duration: 0.33,
										ease: [0.25, 0.1, 0.25, 1]
									}}
									initial={{ opacity: 0, y: "-25%" }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: "-25%" }}
								>
									<Flex
										w={"100%"}
										rounded={"xl"}
										h="100%"
										align={"center"}
										alignItems="center"
										justifyContent={"center"}
									>
										<HStack spacing={4}>
											<VStack spacing={0}>
												<Text fontWeight={500} textAlign={"center"}>
													Getting real-time data about{" "}
													<Text noOfLines={2} maxW={"500px"}>
														{serverValue}
													</Text>
												</Text>
												<Text fontSize={"10px"} opacity={0.7}>
													This shouldn't take longer than 5 seconds
												</Text>
											</VStack>

											<Spinner size={"sm"} />
										</HStack>
									</Flex>
								</motion.div>
							)}
						</AnimatePresence>
					</Flex>
				</Flex>
			</fetcher.Form>
		</>
	);
}
