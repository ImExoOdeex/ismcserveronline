import useAnimationRouteLoaderData from "@/hooks/useAnimationRouteLoaderData";
import Link from "@/layout/global/Link";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Alert, AlertDescription, AlertTitle, Button, Flex, HStack } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { loader } from "./$server_.panel";

export default function ServerPanel() {
	const path = useLocation().pathname;
	const isBedrock = path.split("/")[0] === "bedrock";
	const parentData = useAnimationRouteLoaderData<typeof loader>(
		isBedrock ? "routes/bedrock/$server_.panel" : "routes/$server_.panel"
	);
	if (!parentData) throw new Error("Parent data not found");

	const { server } = parentData;

	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
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
		</Flex>
	);
}
