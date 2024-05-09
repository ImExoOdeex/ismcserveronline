import Link from "@/layout/global/Link";
import config from "@/utils/config";
import { Badge, Flex, HStack, Icon, Image as ChakraImage, Text } from "@chakra-ui/react";
import { memo } from "react";
import { BiUser } from "react-icons/bi";
import type { MLTSServer } from "~/routes/api.mlts";

interface Props {
    server: MLTSServer;
}

export default memo(function MLTSServerCard({ server }: Props) {
    return (
        <Flex
            w="100%"
            bg={"alpha"}
            rounded={"lg"}
            p={4}
            gap={4}
            minH={"133px"}
            as={Link}
            to={`/${server.bedrock ? "bedrock/" : ""}${server.server}`}
            _hover={{
                textDecoration: "none",
                bg: "alpha100"
            }}
            _active={{
                scale: 0.9
            }}
            transition={`all 0.2s ${config.cubicEase}`}
            transform={"auto-gpu"}
            maxW={{
                base: "100%",
                md: "33%"
            }}
        >
            <Flex
                w="100%"
                flexDir={{
                    base: "column",
                    md: "row"
                }}
                gap={4}
            >
                <Flex gap={4} w="100%">
                    <ChakraImage
                        src={server.favicon ?? "/mc-icon.png"}
                        boxSize={24}
                        sx={{
                            imageRendering: "pixelated"
                        }}
                        rounded="md"
                        alignSelf={"center"}
                    />

                    <Flex flexDir={"column"} gap={1} overflow={"hidden"} w="100%">
                        <Flex w="100%" justifyContent={"space-between"}>
                            <Flex flexDir={"column"} gap={1}>
                                <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                                    {server.server}{" "}
                                    {server.owner_id && (
                                        <Badge colorScheme={"green"} ml={1}>
                                            Verified
                                        </Badge>
                                    )}
                                    {server.prime && (
                                        <Badge colorScheme={"purple"} ml={1}>
                                            Prime
                                        </Badge>
                                    )}
                                </Text>
                                <HStack spacing={1}>
                                    <Icon as={BiUser} />
                                    <Text fontSize={"sm"}>
                                        {server.players.online}/{server.players.max}
                                    </Text>
                                </HStack>

                                <Text fontSize={"sm"} color={"textSec"} noOfLines={2}>
                                    {server.description}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
});
