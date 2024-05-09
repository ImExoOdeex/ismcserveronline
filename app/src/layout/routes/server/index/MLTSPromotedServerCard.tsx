import { sendPromotedAction } from "@/functions/promoted";
import Link from "@/layout/global/Link";
import config from "@/utils/config";
import { Badge, Image as ChakraImage, Flex, HStack, Icon, Tag, Text } from "@chakra-ui/react";
import Color from "color";
import { useInView } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { BiUser } from "react-icons/bi";
import { FaHashtag } from "react-icons/fa";
import type { MLTSPromoted } from "~/routes/api.mlts";

interface Props {
    promoted: MLTSPromoted;
    index: number;
    length: number;
}

export default memo(function MLTSPromotedServerCard({
    promoted: { color, Server: server, id },
    index,
    length
}: Props) {
    const bgColor = useMemo(() => {
        return Color(color).alpha(0.1).string();
    }, [color]);
    const bgColorHover = useMemo(() => {
        return Color(color).alpha(0.2).string();
    }, [color]);

    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        sendPromotedAction("Impression", id);
    }, [isInView, id]);

    const handleClick = useCallback(() => {
        sendPromotedAction("Click", id);
    }, [id]);

    return (
        <Flex
            ref={ref}
            w="100%"
            bg={bgColor}
            roundedTop={index === 0 ? "lg" : undefined}
            roundedBottom={index === length - 1 ? "lg" : undefined}
            p={4}
            gap={4}
            minH={"133px"}
            as={Link}
            to={`/${server.bedrock ? "bedrock/" : ""}${server.server}`}
            _hover={{
                textDecoration: "none",
                bg: bgColorHover
            }}
            onClick={handleClick}
            _active={{
                scale: 0.9
            }}
            transition={`all 0.2s ${config.cubicEase}`}
            transform={"auto-gpu"}
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
                                <Text fontSize="lg" fontWeight="bold">
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
                                    <Icon as={BiUser} color={color} />
                                    <Text fontSize={"sm"}>
                                        {server.players.online}/{server.players.max}
                                    </Text>
                                    <Tag
                                        ml={2}
                                        fontSize={"sm"}
                                        flexWrap={"nowrap"}
                                        w="fit-content"
                                        flexShrink={0}
                                        whiteSpace={"none"}
                                        display={"inline-flex"}
                                        bg={bgColor}
                                        scale={1}
                                        _hover={{
                                            bg: bgColorHover
                                        }}
                                        _active={{
                                            bg: bgColorHover,
                                            scale: 1
                                        }}
                                    >
                                        <Icon as={FaHashtag} color={color} mr={1} />
                                        Promoted
                                    </Tag>
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
