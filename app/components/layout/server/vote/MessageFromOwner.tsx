import { Button, Flex, Text } from "@chakra-ui/react";
import { memo } from "react";
import Link from "~/components/utils/Link";

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
			{!ownerId && (
				<Button as={Link} to={`/${bedrock ? "bedrock/" : ""}${server}/verify`} w="min-content" px={6}>
					Your server?
				</Button>
			)}
		</Flex>
	);
});
