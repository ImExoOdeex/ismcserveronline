import {
	Box,
	Flex,
	HStack,
	Icon,
	Input,
	Kbd,
	Spinner,
	Text,
	VStack,
	useColorModeValue,
	useEventListener
} from "@chakra-ui/react";
import { useFetcher, useLocation } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { useActionKey } from "~/components/utils/func/useActionKey";
import { motion } from "framer-motion";

export default function ServerSearch() {
	const actionKey = useActionKey();

	const inputRef: any = useRef();

	useEventListener("keydown", (event: any) => {
		const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform);
		const hotkey = isMac ? "metaKey" : "ctrlKey";
		if (event?.key?.toLowerCase() === "k" && event[hotkey]) {
			event.preventDefault();
			if (inputRef.current === document.activeElement) {
				inputRef.current.blur();
			} else {
				inputRef.current.focus();
			}
		}
	});
	const fetcher = useFetcher();
	const submitting = fetcher.state !== "idle";
	const { pathname } = useLocation();

	const [server, setServer] = useState<string>();
	const bgInputAutoFill = useColorModeValue("#e2e8f0", "#1d1d1d");
	const borderInputAutoFill = useColorModeValue("#dfe4e8", "#262626");

	useEffect(() => {
		if (fetcher.data?.error) {
			setServer("");
		}
	}, [fetcher.data]);

	return (
		<Flex display={{ base: "none", md: "flex" }} w="350px">
			<AnimatePresence mode="wait" initial={false}>
				{pathname !== "/" && (
					<motion.div
						initial={{ x: -40, opacity: 0, scale: 0.975 }}
						animate={{ x: 0, opacity: 1, scale: 1 }}
						exit={{
							x: -40,
							opacity: 0,
							scale: 0.975,
							transition: { duration: 0.2 }
						}}
						transition={{
							ease: [0.25, 0.1, 0.25, 1],
							duration: 0.33
						}}
					>
						<fetcher.Form method="post">
							<Box as="label" srOnly htmlFor="search">
								Search
							</Box>
							<Flex pos={"relative"}>
								<Input
									variant={"filled"}
									w="100%"
									display={"block"}
									rounded={"xl"}
									border={"2px"}
									px={4}
									py={1.5}
									pl={10}
									pr={14}
									fontWeight={"normal"}
									_focus={{ borderColor: "brand" }}
									borderColor={"alpha100"}
									_autofill={{
										borderColor: borderInputAutoFill,
										boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`,
										_active: {
											borderColor: "brand",
											boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`
										},
										_focus: {
											borderColor: "brand",
											boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`
										},
										_hover: {
											borderColor: "brand",
											boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`
										}
									}}
									id="search"
									ref={inputRef}
									disabled={submitting}
									minLength={1}
									name="server"
									onChange={(e) =>
										setServer(e.currentTarget.value)
									}
									value={server}
									placeholder={
										fetcher.data
											? fetcher.data?.error
											: "Server address"
									}
								/>
								<Flex
									pos={"absolute"}
									insetY={"0"}
									left={0}
									alignItems={"center"}
									pl={4}
								>
									<Icon
										as={BiSearchAlt}
										boxSize={5}
										color={"text"}
										fill={"text"}
									/>
								</Flex>
								<Flex
									pos={"absolute"}
									insetY={0}
									right={0}
									flexShrink={0}
									alignItems={"center"}
									pr={4}
								>
									<Kbd
										py={1}
										px={2}
										rounded={"md"}
										fontSize={"xs"}
										border={0}
										bg="alpha100"
									>
										{actionKey} K
									</Kbd>
								</Flex>

								<AnimatePresence mode="wait">
									{submitting && (
										<motion.div
											style={{
												position: "absolute",
												top: "0",
												right: "0",
												left: "0",
												bottom: "0"
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
												w={{ base: "105%", sm: "100%" }}
												h="100%"
												bg="bg"
												align={"center"}
												alignItems="center"
												justifyContent={"center"}
											>
												<HStack>
													<VStack spacing={0}>
														<Text
															fontWeight={400}
															fontSize={"14px"}
														>
															Fetching {server}
														</Text>
														<Text
															fontSize={"10px"}
															opacity={0.7}
														>
															This shouldn't take
															longer than 5
															seconds
														</Text>
													</VStack>

													<Spinner size={"sm"} />
												</HStack>
											</Flex>
										</motion.div>
									)}
								</AnimatePresence>
							</Flex>
						</fetcher.Form>
					</motion.div>
				)}
			</AnimatePresence>
		</Flex>
	);
}
