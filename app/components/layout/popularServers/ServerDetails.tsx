import {
	GridItem,
	HStack,
	SimpleGrid,
	Text,
	VStack,
	Skeleton as ChakraSkeleton,
	type SkeletonProps,
	Flex
} from "@chakra-ui/react";
import { type MinecraftServerWoQuery } from "../../types/minecraftServer";

function Skeleton({ ...props }: SkeletonProps) {
	return <ChakraSkeleton h={3} w="100px" alignSelf={"center"} {...props} />;
}

export default function ServerDetails({ data, colorMode }: { data: MinecraftServerWoQuery; colorMode: "light" | "dark" }) {
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
								<Skeleton />
							)}
						</Text>
					</HStack>
					<HStack spacing={4} align={"start"} alignItems={"center"}>
						<Text fontWeight={"semibold"}>Version</Text>
						<Text>{data?.version ? <>{data.version?.string}</> : <Skeleton />}</Text>
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
											? `${data.motd.html?.replace(/#FFFFFF/g, "#000000").split("\n")[0]}`
											: `${data?.motd?.html ? data?.motd?.html.split("\n")[0] : ""}`
								}}
							></Text>
							<Text
								dangerouslySetInnerHTML={{
									__html:
										colorMode === "light"
											? `${data.motd.html?.replace(/#FFFFFF/g, "#000000").split("\n")[1]}`
											: `${data?.motd?.html?.split("\n")[1] ? data?.motd?.html.split("\n")[1] : ""}`
								}}
							></Text>
						</>
					) : (
						<>
							<Flex w="100%" minH={"24px"} alignItems={"center"}>
								<Skeleton w="100%" />
							</Flex>
							<Flex w="100%" minH={"24px"} alignItems={"center"}>
								<Skeleton w="100%" />
							</Flex>
						</>
					)}
				</VStack>
			</GridItem>
			<GridItem>
				<VStack align={"end"}>
					<HStack spacing={4} alignItems={"center"}>
						<Text>{data?.host ? data.host : <Skeleton />}</Text>
						<Text fontWeight={"semibold"}>Host</Text>
					</HStack>
					<HStack spacing={4} align={"start"} alignItems={"center"}>
						<Text fontFamily={"mono"}>{data?.ping ? data.ping + " miliseconds" : <Skeleton />}</Text>
						<Text fontWeight={"semibold"}>Latency</Text>
					</HStack>
				</VStack>
			</GridItem>
		</SimpleGrid>
	);
}
