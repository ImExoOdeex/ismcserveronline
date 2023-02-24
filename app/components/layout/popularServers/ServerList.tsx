import { CheckIcon } from "@chakra-ui/icons";
import { Flex, Grid, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { FastAverageColor } from "fast-average-color";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
const Color = require("color");

export default function ServerList({
	servers
}: {
	servers: { id: number; server: string }[];
}) {
	const [serversExpanded, setServersExpanded] = useState<number[]>([]);

	const [color, setColor] = useState<any>();
	const fac = new FastAverageColor();
	const ref = useRef<any>();
	useEffect(() => {
		const faqColor = fac.getColor(ref.current);
		setColor(Color(faqColor?.rgba).alpha(0.1).string());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<VStack w="100%" align={"start"} spacing={5}>
			{servers.map((s) => {
				return (
					<Flex
						key={s.id}
						cursor={"pointer"}
						flexDir={"column"}
						px={5}
						py={4}
						w="100%"
						_hover={{
							bg: color,
							rounded: "3xl",
							borderColor: "transparent"
						}}
						borderY={"1px solid"}
						borderColor={"alpha"}
						transition={"all .2s"}
						alignItems={"center"}
						onClick={() => {
							if (serversExpanded.includes(s.id)) {
								setServersExpanded(
									serversExpanded.filter((i) => i !== s.id)
								);
							} else {
								setServersExpanded((prev) => [...prev, s.id]);
							}
						}}
					>
						<Grid
							templateColumns="repeat(4, 1fr)"
							w="100%"
							alignItems={"center"}
						>
							<Flex>
								<Image
									ref={ref}
									className={`${s.id}-img`}
									src="/dirt.png"
									sx={{ imageRendering: "pixelated" }}
									rounded={"sm"}
									boxSize={16}
								/>
							</Flex>
							<Flex>
								<Text
									fontWeight={"semibold"}
									fontFamily={"mono"}
								>
									{s.server}
								</Text>
							</Flex>

							<Flex justifyContent={"end"}>
								<Text fontWeight={"semibold"}>2137</Text>
							</Flex>

							<Flex justifySelf={"flex-end"}>
								<HStack
									rounded={"md"}
									color="green"
									h={"min-content"}
									bg={"rgba(72, 187, 120, 0.1)"}
									w="min-content"
									px={3}
									py={1}
								>
									<Text
										textTransform={"none"}
										fontWeight={600}
									>
										Online
									</Text>
									<CheckIcon />
								</HStack>
							</Flex>
						</Grid>

						<AnimatePresence mode="wait" initial={false}>
							{serversExpanded.includes(s.id) && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ ease: [0.25, 0.1, 0.25, 1] }}
									style={{
										overflow: "hidden",
										display: "block"
									}}
								>
									<Flex>chdf</Flex>
								</motion.div>
							)}
						</AnimatePresence>
					</Flex>
				);
			})}
		</VStack>
	);
}
