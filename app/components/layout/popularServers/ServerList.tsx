import { CheckIcon } from "@chakra-ui/icons";
import { Flex, Grid, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { FastAverageColor } from "fast-average-color";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ServerDetails from "./ServerDetails";
import Pagination from "./Pagination";
const Color = require("color");

export default function ServerList({
	servers,
	count,
	page = 1
}: {
	servers: { id: number; server: string }[];
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
					console.log(ele);

					const faqColor = fac.getColor(ele);
					const color = Color(faqColor?.rgba).alpha(0.15).string();
					setColors((prev) => [...prev, { id: s.id, color }]);
				} while (!ele);

				return null;
			});
		}, 50);
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
				console.log(fetcher.data, serverData);
			}
		}
	}

	return (
		<VStack spacing={2} w="100%" align={"start"}>
			<fetcher.Form style={{ width: "100%" }} method="get">
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
									bg: colors[s.id - 1]?.color,
									rounded: "3xl",
									borderColor: "transparent"
								}}
								borderY={"1px solid"}
								borderColor={"alpha"}
								transition={"all .2s"}
								alignItems={"center"}
								onClick={() => hadleServerClick(s)}
							>
								<Grid templateColumns="repeat(4, 1fr)" w="100%" alignItems={"center"}>
									<Flex>
										<Image
											id={`img${s.id}`}
											src={`/favicons/${s.server.toLowerCase()}.webp`}
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
												display: "block"
											}}
										>
											<ServerDetails data={serverData.find((i) => i.server === s.server)?.data} />
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
