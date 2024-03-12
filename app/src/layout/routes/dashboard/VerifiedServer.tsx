import Link from "@/layout/global/Link";
import type { ServerModel } from "@/types/minecraftServer";
import { Icon } from "@chakra-ui/icons";
import { Badge, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import type { Server } from "@prisma/client";
import { memo } from "react";
import { FiTool } from "react-icons/fi";
import { IoReturnDownForwardOutline } from "react-icons/io5";

interface Props {
	server: Pick<Server, "id" | "favicon" | "server" | "players" | "online" | "bedrock">;
}

export default memo(function VerifiedServer({ server }: Props) {
	return (
		<Flex key={server.id} w="100%" p={4} borderRadius={8} gap={4} bg="alpha" rounded={"xl"}>
			<Flex w="100%" justifyContent={"space-between"}>
				<Flex gap={4} w="100%">
					<Image
						src={
							server?.favicon && server?.favicon !== "null" && server?.favicon !== "undefined"
								? server.favicon
								: "/mc-icon.png"
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

						<Text fontSize="sm">{(server?.players as unknown as ServerModel.Players<any>).online} players</Text>
					</Flex>
				</Flex>

				<Flex
					gap={2}
					alignSelf={{
						base: "flex-end",
						sm: "flex-start"
					}}
				>
					<IconButton
						aria-label={"Refresh data"}
						icon={<Icon as={FiTool} boxSize={5} />}
						fontWeight={"semibold"}
						color={"green.500"}
						_hover={{ color: "green.600", bg: "rgba(0, 255, 21, 0.05)" }}
						_active={{ color: "green.700", bg: "rgba(0, 255, 21, 0.1)" }}
						bg="transparent"
						as={Link}
						to={`/${server.bedrock ? "bedrock/" : ""}${server.server}/panel`}
					/>

					<IconButton
						aria-label={"Go to the server page"}
						icon={<Icon as={IoReturnDownForwardOutline} boxSize={5} />}
						fontWeight={"semibold"}
						color={"brand"}
						_hover={{ color: "brand", bg: "rgba(162, 0, 255, 0.05)" }}
						_active={{ color: "brand", bg: "rgba(162, 0, 255, 0.1)" }}
						bg="transparent"
						as={Link}
						to={`/${server.bedrock ? "bedrock/" : ""}${server.server}`}
					/>
				</Flex>
			</Flex>
		</Flex>
	);
});
