import PromotedServerCard from "@/layout/routes/search/PromotedServerCard";
import ServerCard from "@/layout/routes/search/ServerCard";
import { Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import { memo } from "react";
import type { SearchPromotedServer, SearchServer } from "~/routes/search";

interface Props {
	servers: SearchServer[];
	promoted: SearchPromotedServer[];
}

export default memo(function TopServers({ servers, promoted }: Props) {
	return (
		<Flex flexDir="column" gap={2} zIndex={1} w="100%">
			<Stack direction={{ base: "column", md: "row" }} spacing={2} w="100%">
				{promoted.map((server, index) => {
					return <PromotedServerCard key={index} promoted={server} index={0} length={1} />;
				})}
			</Stack>

			<SimpleGrid
				w="100%"
				spacing={2}
				columns={{
					base: 1,
					md: 2
				}}
			>
				{servers.map((server, index) => {
					return <ServerCard key={index} server={server} index={0} length={1} />;
				})}
			</SimpleGrid>
		</Flex>
	);
});
