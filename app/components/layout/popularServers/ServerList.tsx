import {
	Flex,
	Image,
	Table,
	TableCaption,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr
} from "@chakra-ui/react";

export default function ServerList({
	servers
}: {
	servers: { id: number; server: string }[];
}) {
	return (
		<Flex flexDir={"column"} w="100%">
			<TableContainer>
				<Table variant={"simple"}>
					<Thead>
						<Tr>
							<Th borderColor={"alpha200"}>Icon</Th>
							<Th borderColor={"alpha200"}>Server</Th>
							<Th borderColor={"alpha200"}>Status</Th>
							<Th borderColor={"alpha200"} isNumeric>
								Players
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{servers.map((s) => {
							return (
								<Tr key={s.id}>
									<Td borderColor={"alpha200"}>
										<Image
											src="/dirt.png"
											sx={{ imageRendering: "pixelated" }}
											boxSize={"16"}
											rounded={"sm"}
										/>
									</Td>
									<Td borderColor={"alpha200"}>{s.server}</Td>
									<Td borderColor={"alpha200"}>Status</Td>
									<Td borderColor={"alpha200"} isNumeric>
										Players
									</Td>
								</Tr>
							);
						})}
					</Tbody>
					<TableCaption>
						Most played Minecraft servers ever
					</TableCaption>
				</Table>
			</TableContainer>
		</Flex>
	);
}
