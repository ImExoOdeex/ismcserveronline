import { Flex, Input, Text } from "@chakra-ui/react";

export default function ServerPanel() {
	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
			<Flex
				w="100%"
				gap={2}
				flexDir={{
					base: "column",
					md: "row"
				}}
				alignItems={{
					base: "flex-start",
					md: "center"
				}}
				justifyContent={"space-between"}
			>
				<Flex flexDir={"column"} gap={1}>
					<Text fontSize="lg" fontWeight="600">
						Webhook Url
					</Text>
					<Text color="textSec">Webhook URL that our server will POST to it, when someone votes for your server.</Text>
				</Flex>

				<Input
					variant={"filled"}
					maxW={{
						base: "100%",
						md: "320px"
					}}
					placeholder="https://example.com/api/vote"
				/>
			</Flex>
		</Flex>
	);
}
