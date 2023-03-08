import { CheckIcon } from "@chakra-ui/icons";
import { Flex, Grid, Wrap, WrapItem, Badge, HStack, Image, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import ServerDetails from "./ServerDetails";
import { useState, useEffect } from "react";
import { FastAverageColor } from "fast-average-color";
import { type ServerItemData } from "./ServerList";
import { useFetcher } from "@remix-run/react";
const Color = require("color");

type Props = {
	server: ServerItemData;
};

export default function ServerItem({ server }: Props) {
	const fac = new FastAverageColor();

	const [expanded, setExpanded] = useState<boolean>(false);
	const [color, setColor] = useState();

	useEffect(() => {
		const ele: any = document.querySelector(`#img${server.id}`);
		const faqColor = fac.getColor(ele);
		const color = Color(faqColor?.rgba).alpha(0.15).string();
		setColor(color);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleServerClick() {
		setExpanded(!expanded);
	}

	const fetcher = useFetcher();
	useEffect(() => {
		if (expanded && !fetcher.data) {
			fetcher.load(`/api/server/data?server=${server.server}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [expanded]);

	return (
		<Flex
			role="group"
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
			onClick={handleServerClick}
		>
			<Grid
				templateColumns={{ base: "repeat(2, 2fr)", md: "repeat(4, 1fr)" }}
				gap={{ base: 5, md: 2 }}
				w="100%"
				alignItems={"center"}
			>
				<Flex>
					<Image
						id={`img${server.id}`}
						src={server.icon ?? ""}
						sx={{ imageRendering: "pixelated" }}
						rounded={"sm"}
						h={16}
						w={16}
						alt={`${server.server} favicon`}
					/>
				</Flex>
				<Flex>
					<Text fontWeight={"semibold"} fontFamily={"mono"}>
						{server.server}
					</Text>
				</Flex>

				<Flex justifyContent={{ base: "center", md: "end" }}>
					<Wrap w="100%" spacing={1} justify={"start"}>
						{server?.tags
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
				{expanded && (
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
						<ServerDetails data={fetcher.data?.data} color={color} />
					</motion.div>
				)}
			</AnimatePresence>
		</Flex>
	);
}
