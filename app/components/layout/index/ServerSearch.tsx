import { Flex, FormLabel, HStack, Button, Tooltip, VStack, Spinner, Text, Box } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChakraInput, ChakraBox } from "../MotionComponents";
import { VersionChangeComp } from "./VersionChangeComp";
import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";

type Props = {
	bedrockChecked: boolean;
	setBedrockChecked: (v: boolean) => void;
	serverValue: string;
	setServerValue: (v: string) => void;
};

export default function ServerSearch({ bedrockChecked, serverValue, setBedrockChecked, setServerValue }: Props) {
	const fetcher = useFetcher();

	const [searching, setSearching] = useState<boolean>(false);

	useEffect(() => {
		document.cookie = `bedrock=${bedrockChecked}`;
	}, [bedrockChecked]);

	const variants = {
		closed: {
			width: "100%"
		},
		open: {
			width: "70%"
		}
	};

	const submitting = fetcher.state !== "idle";

	return (
		<>
			<fetcher.Form style={{ width: "100%" }} method="post">
				<Flex w="100%" flexDir={"column"} minH="104px" h="100%" minW={"100%"}>
					<FormLabel ml="14px" fontSize={"12px"} color={fetcher?.data ? "red" : "textSec"} fontWeight={400} mb={1.5}>
						{fetcher?.data ? fetcher.data?.error : "Which server do you want to check?"}
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
									<Flex flexDir={"column"} w="100%">
										<ChakraInput
											rounded={"2xl"}
											placeholder="Hypixel.net"
											name="server"
											pl="14px"
											w="100%"
											onFocus={() => setSearching(true)}
											onBlur={() => setSearching(false)}
											onChange={(e) => setServerValue(e.currentTarget.value)}
											value={serverValue}
											bg="alpha100"
											color="textSec"
											fontWeight={500}
											borderBottomRadius={0}
											_focus={{
												outlineWidth: "2px",
												outlineColor: "text",
												outlineOffset: "-2px"
											}}
											outline={"none"}
											h={"40px"}
											variants={variants}
											animate={searching || serverValue?.length ? "open" : "closed"}
											// @ts-ignore
											transition={{
												duration: 0.2,
												ease: [0.25, 0.1, 0.25, 1]
											}}
										/>

										<ChakraBox
											borderBottomRadius={"2xl"}
											h="40px"
											bg="alpha"
											outlineOffset={"2px"}
											outlineColor={"inv"}
											w="100%"
											pos={"relative"}
											variants={variants}
											zIndex={0}
											animate={searching || serverValue?.length ? "open" : "closed"}
											// @ts-ignore
											transition={{
												duration: 0.2,
												ease: [0.25, 0.1, 0.25, 1]
											}}
										>
											<HStack w="100%" h="100%">
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
										</ChakraBox>
									</Flex>
								</motion.div>
							)}
						</AnimatePresence>

						<Box pos={"absolute"} right={{ base: -1, md: 2 }} top={0} bottom={0}>
							<AnimatePresence mode="wait">
								{(searching || serverValue?.length) && !submitting && (
									<motion.div
										style={{ width: "100%" }}
										transition={{
											duration: 0.3,
											ease: [0.25, 0.1, 0.25, 1]
										}}
										initial={{ opacity: 0, x: 80 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{
											opacity: 0,
											x: !submitting ? 0 : 80,
											transition: {
												duration: 0.15
											}
										}}
									>
										<Tooltip
											hasArrow
											label={`Please Enter valid server address`}
											isDisabled={serverValue?.includes(".")}
										>
											<Button
												rounded={"2xl"}
												variant="brand"
												type="submit"
												w="100%"
												disabled={!serverValue?.includes(".")}
											>
												<Text px={2}>Search</Text>
											</Button>
										</Tooltip>
									</motion.div>
								)}
							</AnimatePresence>
						</Box>

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
