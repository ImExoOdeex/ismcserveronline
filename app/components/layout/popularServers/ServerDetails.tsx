import {
	GridItem,
	HStack,
	SimpleGrid,
	Text,
	VStack,
	Skeleton as ChakraSkeleton,
	type SkeletonProps,
	Flex,
	useColorMode
} from "@chakra-ui/react";
import { type MinecraftServerWoQuery } from "../../types/minecraftServer";
const Color = require("color");

function Skeleton({ endColor = "alpha200", ...props }: { endColor: string } & SkeletonProps) {
	return (
		<ChakraSkeleton
			h={3}
			w="100px"
			alignSelf={"center"}
			startColor={Color(endColor).alpha(0.25).string()}
			endColor={"transparent"}
			{...props}
		/>
	);
}

export default function ServerDetails({ data, color = "" }: { data: MinecraftServerWoQuery; color?: string }) {
	const { colorMode } = useColorMode();

	return (
		<SimpleGrid minChildWidth={"200px"} justifyContent={"space-around"} w="100%" py={8} gap={{ base: 8, md: "unset" }}>
			<GridItem alignContent={"start"}>
				<VStack align={"start"}>
					<HStack spacing={4}>
						<Text fontWeight={"semibold"}>Players</Text>
						<Text>
							{data?.players ? (
								<>
									{data.players.online}/{data.players.max}
								</>
							) : (
								<Skeleton endColor={color} />
							)}
						</Text>
					</HStack>
					<HStack spacing={4} align={"start"} alignItems={"center"}>
						<Text fontWeight={"semibold"}>Version</Text>
						<Text>{data?.version ? <>{data.version?.string}</> : <Skeleton endColor={color} />}</Text>
					</HStack>
				</VStack>
			</GridItem>
			<GridItem>
				<VStack align={"center"} alignItems={"center"} minH="100%" w="100%" textAlign={"center"}>
					{data?.motd ? (
						<>
							<Text
								dangerouslySetInnerHTML={{
									__html:
										colorMode === "light"
											? `${data.motd.html?.replace(/#FFFFFF/g, "#000000").split("\n")[0] ?? ""}`
											: `${data?.motd?.html ? data?.motd?.html.split("\n")[0] : ""}`
								}}
							></Text>
							<Text
								dangerouslySetInnerHTML={{
									__html:
										colorMode === "light"
											? `${data.motd.html?.replace(/#FFFFFF/g, "#000000").split("\n")[1] ?? ""}`
											: `${data?.motd?.html?.split("\n")[1] ? data?.motd?.html.split("\n")[1] : ""}`
								}}
							></Text>
						</>
					) : (
						<>
							<Flex w="100%" minH={"24px"} alignItems={"center"}>
								<Skeleton w="100%" endColor={color} />
							</Flex>
							<Flex w="100%" minH={"24px"} alignItems={"center"}>
								<Skeleton w="100%" endColor={color} />
							</Flex>
						</>
					)}
				</VStack>
			</GridItem>
			<GridItem>
				<VStack align={"end"}>
					<HStack spacing={4} alignItems={"center"}>
						<Text>{data?.host ? data.host : <Skeleton endColor={color} />}</Text>
						<Text fontWeight={"semibold"}>Host</Text>
					</HStack>
					<HStack spacing={4} align={"start"} alignItems={"center"}>
						<Text fontFamily={"mono"}>{data?.ping ? data.ping + " miliseconds" : <Skeleton endColor={color} />}</Text>
						<Text fontWeight={"semibold"}>Latency</Text>
					</HStack>
				</VStack>
			</GridItem>
		</SimpleGrid>
	);
}
