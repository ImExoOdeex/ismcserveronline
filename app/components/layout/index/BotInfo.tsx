import { Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useState, useContext, useEffect } from "react";
import { context } from "~/components/utils/GlobalContext";
import loadable from "@loadable/component";

const BotInfoInside = loadable(() => import(/* webpackPrefetch: true */ "./BotInfoInside"), {
	ssr: true
});

export default function BotInfo() {
	const [opened, setOpened] = useState<boolean>(false);

	const { updateData } = useContext(context);

	useEffect(() => {
		updateData("displayLogoInBg", opened);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	return (
		<VStack w="100%" align={"start"} my={20} spacing={20} onMouseOver={() => BotInfoInside.preload()}>
			<VStack w="100%" align={"start"} spacing={5}>
				<Flex
					p={5}
					rounded={"2xl"}
					bg={"alpha"}
					w="100%"
					flexDir={"column"}
					onClick={() => setOpened(!opened)}
					userSelect={"none"}
					cursor={opened ? "initial" : "pointer"}
					_hover={{ bg: opened ? "" : "alpha100" }}
					_active={{ bg: opened ? "" : "alpha200" }}
					transition={".1s"}
				>
					<VStack align={"start"} spacing={0} pos={"relative"}>
						<Text fontSize={"xs"}>Add our discord bot!</Text>
						<Heading as={"h1"} fontSize={"lg"}>
							Is Minecraft Server Online bot
						</Heading>
						<Text fontSize={"10px"} pos={"absolute"} bottom={{ base: -3, sm: -2 }} right={0}>
							Read {opened ? "less" : "more"}
						</Text>
					</VStack>
					<BotInfoInside opened={opened} />
				</Flex>
			</VStack>
		</VStack>
	);
}
