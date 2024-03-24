import MLTSPromotedServerCard from "@/layout/routes/server/index/MLTSPromotedServerCard";
import MLTSServerCard from "@/layout/routes/server/index/MLTSServerCard";
import type { FlexProps } from "@chakra-ui/react";
import { Flex, Heading, Spinner } from "@chakra-ui/react";
import { useInView } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import type { MLTSPromoted, MLTSServer, loader } from "~/routes/api.mlts";

interface Props extends FlexProps {
	server: string;
	players: number;
	bedrock: boolean;
	language: string | null;
}

export default memo(function MoreLikeThisServer({ server, players, bedrock, language, ...props }: Props) {
	const [isLoading, setIsLoading] = useState(true);
	const [promoted, setPromoted] = useState<MLTSPromoted[]>([]);
	const [servers, setServers] = useState<MLTSServer[]>([]);
	console.log({
		servers,
		promoted
	});

	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });

	useEffect(() => {
		if (!isInView) return;

		console.log("in view");
		fetch(
			`/api/mlts?players=${players}&server=${server}${language ? `&language=${language}` : ""}${bedrock ? "&bedrock" : ""}`
		)
			.then((res) => res.json() as Promise<UseDataFunctionReturn<typeof loader>>)
			.then((data) => {
				if (!data.success) {
					console.error((data as any).message);
					return;
				}
				setIsLoading(false);
				setServers(data.servers);
				setPromoted(data.promoted);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInView]);

	return (
		<Flex ref={ref} flexDir={"column"} gap={4} {...props}>
			<Heading size="md">More Like This Server</Heading>

			{isLoading && (
				<Flex alignItems={"center"} p={10} w="100%" justifyContent={"center"}>
					<Spinner />
				</Flex>
			)}

			<Flex flexDir={"column"} gap={2} w="100%">
				<Flex
					flexDir={{
						base: "column",
						md: "row"
					}}
					w="100%"
					gap={2}
				>
					{promoted.map((promoted) => (
						<MLTSPromotedServerCard key={promoted.id} promoted={promoted} index={0} length={1} />
					))}
				</Flex>

				<Flex
					flexDir={{
						base: "column",
						md: "row"
					}}
					w="100%"
					gap={2}
				>
					{servers.map((server) => (
						<MLTSServerCard key={"mltsserver-" + server.id} server={server} />
					))}
				</Flex>
			</Flex>
		</Flex>
	);
});
