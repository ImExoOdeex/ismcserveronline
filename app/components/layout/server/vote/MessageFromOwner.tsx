import { Flex, Text } from "@chakra-ui/react";
import { memo } from "react";
import VerifyModal from "./verify/VerifyModal";

interface Props {
	message?: string | null;
	ownerId?: string | null;
	server: string;
	bedrock: boolean;
}

export default memo(function MessageFromOwner({ message, ownerId, bedrock, server }: Props) {
	return (
		<Flex w="100%" flexDir={"row"} gap={2} justifyContent={"space-between"} alignItems={"center"}>
			<Flex w="100%" flexDir={"column"} gap={2}>
				<Text fontSize="xl" fontWeight="bold">
					Message from the owner
				</Text>
				<Text>{message || "No message from the owner"}</Text>
			</Flex>
			{!ownerId && <VerifyModal server={server} bedrock={bedrock} />}
		</Flex>
	);
});
