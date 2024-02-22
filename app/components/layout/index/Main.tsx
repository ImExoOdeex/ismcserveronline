import { chakra, Flex, Heading, Image, Stack, Text, VStack } from "@chakra-ui/react";
import { formatBigNumbers } from "~/components/utils/functions/numbers";
import ServerSearch from "./ServerSearch";

export default function Main({
	bedrockChecked,
	serverValue,
	setBedrockChecked,
	query,
	setServerValue,
	count
}: {
	bedrockChecked: boolean;
	serverValue: string;
	query: boolean;
	setBedrockChecked: (e: boolean) => void;
	setServerValue: (e: string) => void;
	count: number;
}) {
	return (
		<Stack spacing={10} direction={{ base: "column", md: "row" }}>
			<VStack spacing={"50px"} w={{ base: "100%", md: "50%" }} mt={"50px"}>
				<Heading as={"h1"} fontSize="3xl">
					<chakra.span color={"orange"}>Real</chakra.span>
					-time
					<chakra.span color={"green"}> Minecraft </chakra.span>
					server
					<chakra.span color={"pink.400"}> status </chakra.span>
					and
					<chakra.span color={"purple.500"}> data </chakra.span>
					checker
				</Heading>

				<ServerSearch
					bedrockChecked={bedrockChecked}
					serverValue={serverValue}
					setBedrockChecked={setBedrockChecked}
					setServerValue={setServerValue}
					loaderQuery={query}
				/>

				<Text as="h2" fontWeight={600} color="textSec" maxW={"423px"} alignSelf="start">
					Get information about your favourite Minecraft server for Java or Bedrock edition! Over{" "}
					{formatBigNumbers(count)} checks have been made!
				</Text>
			</VStack>

			<Flex w={{ base: "100%", md: "50%" }}>
				<Image
					src="/webp/ismcserveronlineimg.webp"
					alt="image"
					h="fit-content"
					aspectRatio={"4/3"}
					sx={{ imageRendering: "pixelated" }}
				/>
			</Flex>
		</Stack>
	);
}
