import { Icon } from "@chakra-ui/icons";
import { Badge, Flex, IconButton, Image, Text, Tooltip, useToast, VisuallyHiddenInput } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { BiRefresh } from "react-icons/bi/index.js";
import { FiTrash2 } from "react-icons/fi/index.js";
import { IoReturnDownForwardOutline } from "react-icons/io5/index.js";
import type { DisplaySavedServer } from "~/routes/dashboard._index";

interface Props {
	server: DisplaySavedServer;
}

export default function SavedServer({ server }: Props) {
	const refreshFetcher = useFetcher();
	const deleteFetcher = useFetcher();
	const goFetcher = useFetcher();

	const toast = useToast();

	useEffect(() => {
		const data = refreshFetcher.data as any;
		if (data) {
			toast({
				title: data?.success ? "Server refreshed!" : "Server not refreshed!",
				status: data?.success ? "success" : "error",
				duration: 9000,
				variant: "subtle",
				position: "bottom-right",
				isClosable: true
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshFetcher.data]);
	useEffect(() => {
		const data = deleteFetcher.data as any;
		if (data) {
			toast({
				title: data?.success ? "Server deleted!" : "Server not deleted!",
				status: data?.success ? "success" : "error",
				duration: 9000,
				variant: "subtle",
				position: "bottom-right",
				isClosable: true
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteFetcher.data]);

	return (
		<Flex key={server.id} w="100%" p={4} borderRadius={8} gap={4} bg="alpha" rounded={"xl"}>
			<Flex w="100%" justifyContent={"space-between"}>
				<Flex gap={4} w="100%">
					<Image
						src={
							server?.icon && server?.icon !== "null" && server?.icon !== "undefined" ? server.icon : "/mc-icon.png"
						}
						boxSize={20}
						sx={{
							imageRendering: "pixelated"
						}}
					/>
					<Flex flexDir="column" gap={1}>
						<Text fontWeight={600} fontSize="sm" whiteSpace={"nowrap"}>
							{server.server}
						</Text>

						<Flex gap={1}>
							<Badge colorScheme={server.bedrock ? "blue" : "purple"}>{server.bedrock ? "Bedrock" : "Java"}</Badge>
							<Badge colorScheme={server.online ? "green" : "red"}>{server.online ? "Online" : "Offline"}</Badge>
						</Flex>

						<Text fontSize="sm">{server.players} players</Text>
					</Flex>
				</Flex>

				<Flex
					gap={2}
					alignSelf={{
						base: "flex-end",
						sm: "flex-start"
					}}
				>
					<deleteFetcher.Form method="DELETE">
						<VisuallyHiddenInput name="server" value={server.server} />
						<VisuallyHiddenInput name="bedrock" value={server.bedrock ? "true" : "false"} />
						<Tooltip label="Delete server" openDelay={200} hasArrow>
							<IconButton
								aria-label={"Delete server"}
								icon={<FiTrash2 />}
								fontWeight={"semibold"}
								type="submit"
								color={"red.500"}
								_hover={{ color: "red.600", bg: "rgba(255, 0, 0, 0.05)" }}
								_active={{ color: "red.700", bg: "rgba(255, 0, 0, 0.1)" }}
								bg="transparent"
								isLoading={deleteFetcher.state !== "idle"}
								name="action"
								value="delete"
							/>
						</Tooltip>
					</deleteFetcher.Form>

					<refreshFetcher.Form method="PATCH">
						<VisuallyHiddenInput name="server" value={server.server} />
						<VisuallyHiddenInput name="bedrock" value={server.bedrock ? "true" : "false"} />
						<Tooltip label="Refresh data" openDelay={200} hasArrow>
							<IconButton
								aria-label={"Refresh data"}
								icon={<Icon as={BiRefresh} boxSize={5} />}
								fontWeight={"semibold"}
								type="submit"
								color={"yellow.500"}
								_hover={{ color: "yellow.600", bg: "rgba(255, 217, 0, 0.05)" }}
								_active={{ color: "yellow.700", bg: "rgba(255, 217, 0, 0.1)" }}
								bg="transparent"
								isLoading={refreshFetcher.state !== "idle"}
								name="action"
								value="refresh"
							/>
						</Tooltip>
					</refreshFetcher.Form>

					<goFetcher.Form method="POST">
						<VisuallyHiddenInput name="server" value={server.server} />
						<VisuallyHiddenInput name="bedrock" value={server.bedrock ? "true" : "false"} />
						<Tooltip label="Go to the server page" openDelay={200} hasArrow>
							<IconButton
								aria-label={"Go to the server page"}
								icon={<Icon as={IoReturnDownForwardOutline} boxSize={5} />}
								fontWeight={"semibold"}
								type="submit"
								color={"brand"}
								_hover={{ color: "brand", bg: "rgba(162, 0, 255, 0.05)" }}
								_active={{ color: "brand", bg: "rgba(162, 0, 255, 0.1)" }}
								bg="transparent"
								isLoading={goFetcher.state !== "idle"}
								name="action"
								value="go"
							/>
						</Tooltip>
					</goFetcher.Form>
				</Flex>
			</Flex>
		</Flex>
	);
}
