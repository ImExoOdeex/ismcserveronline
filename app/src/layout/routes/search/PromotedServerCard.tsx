import { sendPromotedAction } from "@/functions/promoted";
import Link from "@/layout/global/Link";
import {
    Badge,
    Button,
    Image as ChakraImage,
    Flex,
    HStack,
    Icon,
    Tag,
    Text
} from "@chakra-ui/react";
import Color from "color";
import { useInView } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { BiUser } from "react-icons/bi";
import { FaChevronUp, FaHashtag } from "react-icons/fa";
import type { SearchServer } from "~/routes/search";

interface Props {
    promoted: {
        id: number;
        Server: SearchServer;
        color: string;
    };
    index: number;
    length: number;
    defaultWrap?: boolean;
}

export default memo(function PromotedServerCard({
    promoted: { color, Server: server, id },
    index,
    length,
    defaultWrap = false
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

    const buttons = useMemo(() => {
        return (
            <>
                <Button
                    as={Link}
                    to={`/${server.server}`}
                    variant={"solid"}
                    bg={bgColor}
                    onClick={handleClick}
                    _hover={{
                        bg: bgColorHover,
                        textDecoration: "none"
                    }}
                >
                    View
                </Button>
                <Button
                    as={Link}
                    to={`/${server.server}/vote`}
                    variant={"solid"}
                    leftIcon={<Icon as={FaChevronUp} />}
                    bg={bgColor}
                    onClick={handleClick}
                    _hover={{
                        bg: bgColorHover,
                        textDecoration: "none"
                    }}
                >
                    Vote ({server.votes_month})
                </Button>
            </>
        );
    }, [server.votes_month, server.server, bgColor, bgColorHover, handleClick]);

    return (
        <Flex
            ref={ref}
            w="100%"
            bg={bgColor}
            roundedTop={index === 0 ? "xl" : undefined}
            roundedBottom={index === length - 1 ? "xl" : undefined}
            p={4}
            gap={4}
            minH={"133px"}
        >
            <Flex
                w="100%"
                flexDir={
                    defaultWrap
                        ? "column"
                        : {
                            base: "column",
                            md: "row"
                        }
                }
                gap={4}
            >
                <Flex gap={4} w="100%">
                    <ChakraImage
                        alt={server.server + "'s icon"}
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
                                <Link
                                    to={`/${server.bedrock ? "bedrock/" : ""}${server.server}`}
                                    fontSize="lg"
                                    fontWeight="bold"
                                    onClick={handleClick}
                                >
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
                                </Link>
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
                                    >
                                        <Icon as={FaHashtag} color={color} mr={1} />
                                        Promoted
                                    </Tag>
                                </HStack>
                            </Flex>

                            {!defaultWrap && (
                                <HStack
                                    display={{
                                        base: "none",
                                        md: "flex"
                                    }}
                                    alignItems={"flex-start"}
                                >
                                    {buttons}
                                </HStack>
                            )}
                        </Flex>
                        <Text fontSize={"sm"} color={"textSec"} noOfLines={2}>
                            {server.description}
                        </Text>
                    </Flex>
                </Flex>

                <HStack
                    display={
                        defaultWrap
                            ? "flex"
                            : {
                                base: "flex",
                                md: "none"
                            }
                    }
                    justifyContent={"flex-end"}
                    w="100%"
                >
                    {buttons}
                </HStack>
            </Flex>
        </Flex>
    );
});
