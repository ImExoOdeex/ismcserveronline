import { db } from "@/.server/db/db";
import { requireEnv } from "@/.server/functions/env.server";
import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useAnyPrime from "@/hooks/useAnyPrime";
import useServerPanelData from "@/hooks/useServerPanelData";
import Link from "@/layout/global/Link";
import RealTimeServerDataWrapper from "@/layout/routes/server/panel/realtime/RealTimeServerDataWrapper";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Alert, AlertDescription, AlertTitle, Button, Flex, HStack } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaArgs, MetaFunction } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ params, matches }: MetaArgs) {
	return [
		{
			title: params.server + "'s real-time data | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	csrf(request);

	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[1] === "bedrock";

	const server = await db.server.findFirst({
		where: {
			server: params.server?.toLowerCase(),
			bedrock
		},
		select: {
			id: true
		}
	});
	invariant(server, "Server not found");

	const token = await db.serverToken
		.findUnique({
			where: {
				server_id: server.id
			},
			select: {
				id: true,
				token: true,
				calls: true,
				created_at: true
			}
		})
		.catch(() => null);

	const wsUrl = requireEnv("WS_URL");
	console.log("wsUrl", wsUrl);

	return typedjson({ token: token?.token || null, url: wsUrl });
}

export default function ServerPanel() {
	const { token, url } = useAnimationLoaderData<typeof loader>();
	const server = useServerPanelData();
	const hasPrime = useAnyPrime(server);

	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
			{hasPrime && <RealTimeServerDataWrapper token={token} url={url} />}
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
