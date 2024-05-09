import type { AnyServerModel, JavaServerWoDebug } from "@/types/minecraftServer";
import { Flex, Heading, Image, Stack, Text, VStack } from "@chakra-ui/react";
import { memo } from "react";
import StatusIndicator from "../index/StatusIndicator";

interface Props {
    server: string;
    data: AnyServerModel;
    bedrock: boolean;
}

export default memo(function ServerVoteView({ server, data, bedrock }: Props) {
    return (
        <Stack
            direction={{ base: "column", md: "row" }}
            spacing={5}
            justifyContent={"space-between"}
            w="100%"
        >
            {!bedrock && (data as unknown as JavaServerWoDebug)?.favicon && (
                <Image
                    src={(data as unknown as JavaServerWoDebug)?.favicon ?? ""}
                    alt={`${server} favicon`}
                    boxSize="170px"
                    sx={{ imageRendering: "pixelated" }}
                />
            )}

            <VStack
                spacing={4}
                flexDir={"column"}
                justifyContent="flex-start"
                py={4}
                w="100%"
                align={"center"}
            >
                <Flex flexDir={"row"} justifyContent={"space-between"} w="100%">
                    <Flex flexDir={"column"}>
                        <Text fontSize={"lg"} fontWeight={500} letterSpacing={"2px"}>
                            Voting for
                        </Text>
                        <Heading
                            fontSize={{
                                base: "md",
                                sm: "2xl",
                                md: "4xl"
                            }}
                            letterSpacing={"3px"}
                            as={"a"}
                            target="_blank"
                            href={`http://${server}`}
                        >
                            {server}
                        </Heading>
                    </Flex>

                    <StatusIndicator online={data.online} />
                </Flex>
            </VStack>
        </Stack>
    );
});
