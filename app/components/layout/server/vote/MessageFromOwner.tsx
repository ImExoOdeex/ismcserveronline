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
		<Flex w="100%" flexDir={"column"} gap={2}>
			<Text fontSize="xl" fontWeight="bold">
				Message from the owner
			</Text>
			<Text>{message || "No message from the owner"}</Text>

			{!ownerId && (
				<Flex mt={2} flexDir={"column"} gap={2}>
					<Text fontWeight={500} textDecor={"underline"}>
						Do you own this server?
					</Text>

					<Button as={Link} to={`/${bedrock ? "bedrock/" : ""}${server}/verify`} w="min-content" px={6}>
						Verify
					</Button>
				</Flex>
			)}
		</Flex>
	);
});
