import useMinecraftTextFormatting from "@/hooks/useMinecraftTextFormatting";
import { AnyServer, AnyServerModel, JavaServer, MinecraftServer, ServerModel } from "@/types/minecraftServer";
import { Button, Flex, Heading, Spinner, Table, TableContainer, Tbody, Td, Text, Tr, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { memo, useMemo } from "react";

interface Props {
	server: string;
	data: AnyServerModel | AnyServer;
	bedrock: boolean;
	query: boolean;
}

export default memo(function ServerInfo({ server, bedrock, data, query }: Props) {
	const fetcher = useFetcher();
	const busy = useMemo(() => {
		return fetcher.state !== "idle";
	}, [fetcher.state]);

	const version = useMinecraftTextFormatting(
		(bedrock
			? (data.version as unknown as ServerModel.Version<true>)
			: (data.version as unknown as ServerModel.Version<false>)?.string) ?? ""
	);

	const players = useMinecraftTextFormatting(
		(data.players as unknown as ServerModel.Players<any>).list?.map((p) => p.name).join(", ")
	);

	const software = useMinecraftTextFormatting((data as unknown as JavaServer).software ?? "");

	if (!data.online) return null;
	return (
		<VStack spacing={"20px"} align="start" fontWeight={600} w="100%" maxW={"100%"}>
			<Heading as={"h2"} fontSize="lg">
				General info
			</Heading>

			<Flex overflowX={"auto"} w="100%" maxW={"100%"} pos={"relative"}>
				<TableContainer>
					<Table variant={"unstyled"} size={"sm"}>
						<Tbody>
							<Tr>
								<Td>Players</Td>
								<Td fontWeight={"normal"}>
									{(data.players as unknown as ServerModel.Players<any>).online} /{" "}
									{(data.players as unknown as ServerModel.Players<any>).max}
								</Td>
							</Tr>
							<Tr>
								<Td>Version</Td>
								<Td
									fontWeight={"normal"}
									dangerouslySetInnerHTML={{
										__html: version
									}}
								></Td>
							</Tr>
							{query && (
								<Tr>
									<Td>Map</Td>
									<Td
										fontWeight={"normal"}
										color={(data as unknown as MinecraftServer)?.map ? "text" : "textSec"}
									>
										{(data as unknown as MinecraftServer)?.map
											? (data as unknown as MinecraftServer).map
											: "Unable to get"}
									</Td>
								</Tr>
							)}
							{!bedrock && (
								<Tr>
									<Td>Ping</Td>
									<Td fontWeight={"normal"} fontFamily={"mono"}>
										{(data as unknown as JavaServer).ping} miliseconds
									</Td>
								</Tr>
							)}
							{!bedrock && (
								<Tr>
									<Td>Player List</Td>
									{(data.players as unknown as ServerModel.Players<false>)?.list?.length ? (
										<Td
											fontWeight={"normal"}
											dangerouslySetInnerHTML={{
												__html: players
											}}
										></Td>
									) : (
										<Td fontWeight={"normal"} color={"textSec"}>
											Unable to get
										</Td>
									)}
								</Tr>
							)}
							{query && (
								<Tr>
									<Td>Plugins</Td>
									{(data as unknown as MinecraftServer).plugins?.length ? (
										<>
											{(data as unknown as MinecraftServer).plugins.map((p: string) => {
												return (
													<Td fontWeight={"normal"} key={p}>
														{p}
													</Td>
												);
											})}
										</>
									) : (
										<Td fontWeight={"normal"} color={"textSec"}>
											Unable to get
										</Td>
									)}
								</Tr>
							)}
						</Tbody>
					</Table>
				</TableContainer>
			</Flex>

			<Heading as={"h2"} fontSize="lg">
				Debug info
			</Heading>

			<Flex overflowX={"auto"} w="100%" maxW={"100%"} pos={"relative"}>
				<TableContainer>
					<Table variant={"unstyled"} size={"sm"}>
						<Tbody>
							<Tr>
								<Td>Host</Td>
								<Td fontWeight={"normal"}>{(data as unknown as AnyServer).host}</Td>
							</Tr>
							{query && (
								<Tr>
									<Td>IP</Td>
									<Td
										fontWeight={"normal"}
										color={(data as unknown as MinecraftServer)?.ip ? "text" : "textSec"}
									>
										{(data as unknown as MinecraftServer)?.ip
											? (data as unknown as MinecraftServer).ip
											: "Unable to get"}
									</Td>
								</Tr>
							)}
							<Tr>
								<Td>Port</Td>
								<Td fontWeight={"normal"}>{typeof data.port === "object" ? data.port?.ipv4 : data.port}</Td>
							</Tr>
							<Tr>
								<Td>Protocol</Td>
								<Td fontWeight={"normal"}>{data.protocol}</Td>
							</Tr>
							{!bedrock && (
								<Tr>
									<Td>Software</Td>
									<Td
										fontWeight={"normal"}
										dangerouslySetInnerHTML={{
											__html: software
										}}
									/>
								</Tr>
							)}
						</Tbody>
					</Table>
				</TableContainer>
			</Flex>

			{!query && (
				<fetcher.Form method="POST">
					<Text color="textSec" fontWeight={400}>
						Misleading information?{" "}
						<Button
							variant={"unstyled"}
							type="submit"
							fontWeight={500}
							textDecor="underline"
							color={"sec"}
							h="min-content"
							name="action"
							value="query"
						>
							Try searching with Query!
						</Button>
						{busy && <Spinner color="sec" size={"xs"} ml={2} />}
					</Text>
				</fetcher.Form>
			)}
		</VStack>
	);
});
