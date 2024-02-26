import { Divider, Flex, HStack, Image, Text } from "@chakra-ui/react";
import { PaymentStatus, Prisma } from "@prisma/client";

interface Props {
	server: {
		id: number;
		Server: {
			id: number;
			server: string;
			bedrock: boolean;
			online: boolean;
			players: Prisma.JsonValue;
			favicon: string | null;
		};
		add_date: Date;
		end_date: Date | null;
		payment_status: PaymentStatus;
	};
	isLast?: boolean;
}

export default function YourServer({ server, isLast }: Props) {
	return (
		<>
			<Flex
				flexDir={{
					base: "column",
					md: "row"
				}}
				w="100%"
				gap={10}
				justifyContent={"space-between"}
			>
				<Flex flexDir={"row"} gap={4} alignItems={"center"}>
					<Image src={server.Server.favicon ?? ""} boxSize={20} rounded={"sm"} />

					<Flex flexDir={"column"} gap={0.5}>
						<Text fontWeight={500}>Name</Text>
						<Text fontSize={"xl"} fontWeight={600} letterSpacing={"2px"}>
							{server.Server.server}
						</Text>
					</Flex>
				</Flex>

				<HStack spacing={5}>
					<Flex flexDir={"column"} gap={0.5}>
						<Text fontWeight={500}>End Date</Text>
						<Text fontSize={"xl"} fontWeight={600} letterSpacing={"2px"}>
							{server?.end_date ? server?.end_date?.toLocaleDateString() : "Not set"}
						</Text>
					</Flex>
					<Flex flexDir={"column"} gap={0.5}>
						<Text fontWeight={500}>Add Date</Text>
						<Text fontSize={"xl"} fontWeight={600} letterSpacing={"2px"}>
							{server?.add_date?.toLocaleDateString()}
						</Text>
					</Flex>
					<Flex flexDir={"column"} gap={0.5}>
						<Text fontWeight={500}>Payment Status</Text>
						<Text fontSize={"xl"} fontWeight={600} letterSpacing={"2px"}>
							{server?.payment_status}
						</Text>
					</Flex>
				</HStack>
			</Flex>
			{!isLast && <Divider />}
		</>
	);
}
