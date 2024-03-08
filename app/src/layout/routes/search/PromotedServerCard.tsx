import Link from "@/layout/global/Link";
import { Badge, Button, Image as ChakraImage, Flex, HStack, Icon, Tag, Text } from "@chakra-ui/react";
import { PromotedViewType } from "@prisma/client";
import Color from "color";
import { useInView } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { BiUser } from "react-icons/bi";
import { FaChevronUp, FaHashtag } from "react-icons/fa";
import { SearchServer } from "~/routes/search";

interface Props {
	promoted: {
		id: number;
		Server: SearchServer;
		color: string;
	};
	index: number;
	length: number;
}

export default memo(function PromotedServerCard({ promoted: { color, Server: server, id }, index, length }: Props) {
	const bgColor = useMemo(() => {
		console.log("memo color");

		return Color(color).alpha(0.1).string();
	}, []);

	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true });

	useEffect(() => {
		if (!isInView) return;

		console.log("in view");
		fetch("/api/promoted/view", {
			method: "PUT",
			body: new URLSearchParams({
				id: id.toString(),
				type: "Impression" as PromotedViewType
			})
		})
			.then((res) => {
				if (res.ok) {
					return res.json().then(console.info);
				}
			})
			.catch(console.error);
	}, [isInView]);

	const handleClick = useCallback(() => {
		console.log("click");

		fetch("/api/promoted/click", {
			method: "PUT",
			body: new URLSearchParams({
				id: id.toString(),
				type: "Click" as PromotedViewType
			})
		})
			.then((res) => {
				if (res.ok) {
					return res.json().then(console.info);
				}
			})
			.catch(console.error);
	}, [id]);

	const buttons = useMemo(() => {
		return (
			<>
				<Button as={Link} to={`/${server.server}`} variant={"solid"} bg={bgColor} onClick={handleClick}>
					View
				</Button>
				<Button
					as={Link}
					to={`/${server.server}/vote`}
					variant={"solid"}
					leftIcon={<Icon as={FaChevronUp} />}
					bg={bgColor}
					onClick={handleClick}
				>
					Vote ({server._count.Vote})
				</Button>
			</>
		);
	}, [server._count.Vote, server.server]);

	return (
		<Flex
			ref={ref}
			w="100%"
			bg={bgColor}
			roundedTop={index === 0 ? "xl" : undefined}
			roundedBottom={index === length - 1 ? "xl" : undefined}
			p={4}
			gap={4}
			minH={"133px"}
		>
			<Flex
				w="100%"
				flexDir={{
					base: "column",
					md: "row"
				}}
				gap={4}
			>
				<Flex gap={4} w="100%">
					<ChakraImage
						src={server.favicon ?? "/mc-icon.png"}
						boxSize={24}
						sx={{
							imageRendering: "pixelated"
						}}
						rounded="md"
						alignSelf={"center"}
					/>

					<Flex flexDir={"column"} gap={1} overflow={"hidden"} w="100%">
						<Flex w="100%" justifyContent={"space-between"}>
							<Flex flexDir={"column"} gap={1}>
								<Link
									to={`/${server.bedrock ? "bedrock/" : ""}${server.server}`}
									fontSize="lg"
									fontWeight="bold"
									onClick={handleClick}
								>
									{server.server}{" "}
									{server.owner_id && (
										<Badge colorScheme={"green"} ml={1}>
											Verified
										</Badge>
									)}
									{server.prime && (
										<Badge colorScheme={"purple"} ml={1}>
											Prime
										</Badge>
									)}
								</Link>
								<HStack spacing={1}>
									<Icon as={BiUser} color={color} />
									<Text fontSize={"sm"}>
										{server.players.online}/{server.players.max}
									</Text>
									<Tag
										ml={2}
										fontSize={"sm"}
										flexWrap={"nowrap"}
										w="fit-content"
										flexShrink={0}
										whiteSpace={"none"}
										display={"inline-flex"}
										bg={bgColor}
									>
										<Icon as={FaHashtag} color={color} mr={1} />
										Promoted
									</Tag>
								</HStack>

								<Text fontSize={"sm"} color={"textSec"} noOfLines={2}>
									{server.description}
								</Text>
							</Flex>

							<HStack
								display={{
									base: "none",
									md: "flex"
								}}
							>
								{buttons}
							</HStack>
						</Flex>
					</Flex>
				</Flex>

				<HStack
					display={{
						base: "flex",
						md: "none"
					}}
					justifyContent={"flex-end"}
					w="100%"
				>
					{buttons}
				</HStack>
			</Flex>
		</Flex>
	);
});
