import type { FlexProps } from "@chakra-ui/react";
import { Flex, Heading, Image } from "@chakra-ui/react";
import { useInView } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import type { MLTSServer, loader } from "~/routes/api.mlts";

interface Props extends FlexProps {
	players: number;
	bedrock: boolean;
	language: string | null;
}

export default memo(function MoreLikeThisServer({ players, bedrock, language, ...props }: Props) {
	const [servers, setServers] = useState<MLTSServer[]>([]);

	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });

	useEffect(() => {
		if (!isInView) return;

		console.log("in view");
		fetch(`/api/mlts?players=${players}${language ? `&language=${language}` : ""}${bedrock ? "&bedrock" : ""}`)
			.then((res) => res.json() as Promise<UseDataFunctionReturn<typeof loader>>)
			.then((data) => {
				if (!data.success) {
					console.error((data as any).message);
					return;
				}
				setServers(data.servers);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInView]);

	return (
		<Flex ref={ref} flexDir={"column"} gap={4} {...props}>
			<Heading size="md">More Like This</Heading>

			<Flex
				flexDir={{
					base: "column",
					md: "row"
				}}
				w="100%"
				gap={2}
			>
				{servers.map((server) => (
					<Flex key={server.id} gap={2} p={2} bg="alpha" rounded={"md"} w={"100%"}>
						<Image
							boxSize={14}
							src={server.favicon ?? "/mc-icon.png"}
							rounded={"sm"}
							alt={server.server + "'s icon"}
						/>

						<Flex flexDir={"column"} gap={1}>
							<Heading size="sm">{server.server}</Heading>
							<Flex gap={2}>
								{server.Tags.map((tag) => (
									<Heading size="xs" key={tag.name}>
										{tag.name}
									</Heading>
								))}
							</Flex>
						</Flex>
					</Flex>
				))}
			</Flex>
		</Flex>
	);
});
