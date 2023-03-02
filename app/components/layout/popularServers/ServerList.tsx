import { CheckIcon } from "@chakra-ui/icons";
import { Badge, Box, Flex, Grid, HStack, Heading, Image, Text, VStack, Wrap, WrapItem, useColorMode } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { FastAverageColor } from "fast-average-color";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ServerDetails from "./ServerDetails";
import { type Prisma } from "@prisma/client";
import loadable from "@loadable/component";
const Color = require("color");

const Pagination = loadable(() => import("./Pagination"), {
	ssr: true,
	fallback: <Box minH={"40px"} h="100%" />
});

export default function ServerList({
	servers,
	count,
	page = 1
}: {
	servers: { id: number; server: string; icon: string | null; tags: Prisma.JsonValue }[];
	count: number;
	page?: number;
}) {
	const [serversExpanded, setServersExpanded] = useState<number[]>([]);

	const [colors, setColors] = useState<{ id: number; color: string }[]>([]);

	const fac = new FastAverageColor();

	useEffect(() => {
		// timeout, cause FastAverageColor gives error of no sizes for this images
		setTimeout(() => {
			Array.from(servers, (s) => {
				let ele: any;
				do {
					ele = document.querySelector(`#img${s.id}`);
					const faqColor = fac.getColor(ele);
					const color = Color(faqColor?.rgba).alpha(0.15).string();
					setColors((prev) => [...prev, { id: s.id, color }]);
				} while (!ele);

				return null;
			});
		}, 1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [serverData, setServerData] = useState<{ data: any; server: string }[]>([]);
	const fetcher = useFetcher();

	useEffect(() => {
		if (!serverData.some((x) => x.server === fetcher.data?.server)) {
			if (fetcher.data) {
				setServerData((prev) => [...prev, { data: fetcher.data.data, server: fetcher.data.server }]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	function hadleServerClick(s: { id: number; server: string }) {
		if (serversExpanded.includes(s.id)) {
			return setServersExpanded(serversExpanded.filter((i) => i !== s.id));
		} else if (serverData.find((i) => i.server === s.server)) {
			return setServersExpanded((prev) => [...prev, s.id]);
		} else if (fetcher.state !== "idle") {
			return null;
		} else {
			setServersExpanded((prev) => [...prev, s.id]);
			if (!serverData.find((i) => i.server === s.server)?.server) {
				fetcher.load(`/api/server/data?server=${s.server}`);
			}
		}
	}

	const { colorMode } = useColorMode();

	return (
		<VStack spacing={5} w="100%" align={"start"} pb={5}>
			<Text fontSize={"xs"}>Click on any server to view details!</Text>
			<Flex flexDir={"row"} justifyContent={"space-between"} alignItems={"center"} w="100%">
				<Heading fontSize={"sm"}>Page {page}</Heading>
				<Heading fontSize={"sm"}>
					Showing {servers[0].id} - {servers[servers.length - 1].id}
				</Heading>
			</Flex>
			<fetcher.Form style={{ width: "100%" }} method="get">
				<VStack w="100%" align={"start"} spacing={5}>
					{servers.map((s) => {
						return (
							<Flex
								key={s.id}
								role="group"
								cursor={"pointer"}
								flexDir={"column"}
								px={5}
								py={4}
								w="100%"
								_hover={{
									bg: colors.find((c) => c.id === s.id)?.color,
									rounded: "3xl",
									borderColor: "transparent"
								}}
								borderY={"1px solid"}
								borderColor={"alpha"}
								transition={"all .2s"}
								alignItems={"center"}
								onClick={() => hadleServerClick(s)}
							>
								<Grid
									templateColumns={{ base: "repeat(2, 2fr)", md: "repeat(4, 1fr)" }}
									gap={{ base: 5, md: 2 }}
									w="100%"
									alignItems={"center"}
								>
									<Flex>
										<Image
											id={`img${s.id}`}
											src={s.icon ?? ""}
											sx={{ imageRendering: "pixelated" }}
											rounded={"sm"}
											h={16}
											w={16}
											alt={`${s.server} favicon`}
										/>
									</Flex>
									<Flex>
										<Text fontWeight={"semibold"} fontFamily={"mono"}>
											{s.server}
										</Text>
									</Flex>

									<Flex justifyContent={{ base: "center", md: "end" }}>
										<Wrap w="100%" spacing={1} justify={"start"}>
											{s?.tags
												?.toString()
												.split(",")
												.map((tag: string) => (
													<WrapItem key={tag}>
														<Badge
															w={"fit-content"}
															_groupHover={{
																bg: "alpha200"
															}}
															transition={"background .2s"}
														>
															{tag}
														</Badge>
													</WrapItem>
												))}
										</Wrap>
									</Flex>

									<Flex justifyContent={{ base: "center", md: "end" }}>
										<HStack
											rounded={"md"}
											color="green"
											h={"min-content"}
											bg={"rgba(72, 187, 120, 0.1)"}
											w="min-content"
											px={3}
											py={1}
										>
											<Text textTransform={"none"} fontWeight={600}>
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
											transition={{
												ease: [0.25, 0.1, 0.25, 1]
											}}
											style={{
												overflow: "hidden",
												display: "block",
												width: "100%"
											}}
										>
											<ServerDetails
												data={serverData.find((i) => i.server === s.server)?.data}
												colorMode={colorMode}
												color={colors.find((c) => c.id === s.id)?.color}
											/>
										</motion.div>
									)}
								</AnimatePresence>
							</Flex>
						);
					})}
				</VStack>
			</fetcher.Form>
			<Pagination page={page} count={count} />
		</VStack>
	);
}
