import { Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { type Prisma } from "@prisma/client";
import { Ad, adType } from "~/components/ads/Yes";
import Pagination from "./Pagination";
import ServerItem from "./ServerItem";

export type ServerItemData = { id: number; server: string; icon: string | null; tags: Prisma.JsonValue };

export default function ServerList({ servers, count, page = 1 }: { servers: ServerItemData[]; count: number; page?: number }) {
	return (
		<VStack spacing={5} w="100%" align={"start"} pb={5}>
			<Text fontSize={"sm"}>Click on any server to view details!</Text>
			<Flex flexDir={"row"} justifyContent={"space-between"} alignItems={"center"} w="100%">
				<Heading fontSize={"sm"}>Page {page}</Heading>
				<Heading fontSize={"sm"}>
					Showing {servers[0].id} - {servers[servers.length - 1].id}
				</Heading>
			</Flex>
			<VStack w="100%" align={"start"} spacing={5}>
				{servers.map((server) => {
					return <ServerItem server={server} key={server.id} />;
				})}
			</VStack>
			<Pagination page={page} count={count} />
			<Ad type={adType.multiplex} />
		</VStack>
	);
}
