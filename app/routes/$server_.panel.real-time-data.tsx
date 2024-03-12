import useAnyPrime from "@/hooks/useAnyPrime";
import useServerPanelData from "@/hooks/useServerPanelData";
import Link from "@/layout/global/Link";
import RealTimeServerDataWrapper from "@/layout/routes/server/panel/realtime/RealTimeServerDataWrapper";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Alert, AlertDescription, AlertTitle, Button, Flex, HStack } from "@chakra-ui/react";
import type { MetaArgs, MetaFunction } from "@remix-run/react";

export function meta({ params, matches }: MetaArgs) {
	return [
		{
			title: params.server + "'s real-time data | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export default function ServerPanel() {
	const server = useServerPanelData();
	const hasPrime = useAnyPrime(server);

	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
			{hasPrime && <RealTimeServerDataWrapper />}
			{!hasPrime && (
				<Alert
					status="warning"
					variant="subtle"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					textAlign="center"
					height="200px"
					py={4}
				>
					<InfoOutlineIcon
						pos="relative"
						top={{
							base: 2,
							md: 0
						}}
						boxSize={5}
						mr={0}
						color={"orange"}
						filter={"drop-shadow(0px 0px 6px rgba(255, 119, 0, 0.5))"}
					/>
					<AlertTitle mt={4} mb={1} fontSize="lg">
						Subscription Feature
					</AlertTitle>
					<AlertDescription maxWidth="sm">
						Real-time data is a prime feature and requires a plugin to be installed on your server.
					</AlertDescription>

					<HStack>
						<Button mt={4} colorScheme="orange" variant={"ghost"} as={Link} to={"/plugin"}>
							Install Plugin
						</Button>
						<Button
							mt={4}
							colorScheme="orange"
							variant={"ghost"}
							as={Link}
							to={`${server.bedrock ? "/bedrock" : ""}/${server.server}/panel/subscription`}
						>
							Subscribe
						</Button>
					</HStack>
				</Alert>
			)}
		</Flex>
	);
}
