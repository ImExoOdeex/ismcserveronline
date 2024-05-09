import type { FormatData } from "@/hooks/useFormattedDiscordText";
import useFormattedDiscordText from "@/hooks/useFormattedDiscordText";
import type { DiscordMessage } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import EmbedPreview from "@/layout/routes/dashboard/bot/editor/EmbedPreview";
import { CheckIcon } from "@chakra-ui/icons";
import { Flex, HStack, Image, Text, Tooltip } from "@chakra-ui/react";

interface Props {
    message: DiscordMessage;
    data?: FormatData;
}

export default function Preview({ message, data }: Props) {
    const content = useFormattedDiscordText(message.content, data);

    return (
        <Flex gap={4}>
            <Image boxSize={10} rounded={"full"} src="/webp/statusbotlogo512.webp" />
            <Flex flexDir={"column"} gap={2}>
                <Flex flexDir={"column"}>
                    <HStack>
                        <Text
                            fontWeight={500}
                            letterSpacing={"0.5px"}
                            _hover={{ textDecoration: "underline" }}
                            cursor={"pointer"}
                            id={"username"}
                        >
                            Is Minecraft Server Online
                        </Text>
                        <Flex gap={1} alignItems={"center"} px={1.5} rounded={"3px"} bg="#5961ec">
                            <Tooltip
                                label="Verified Bot"
                                bg="#5961ec !important"
                                color="white"
                                p={1}
                                px={3}
                                rounded="md"
                                hasArrow
                                arrowSize={6}
                                arrowShadowColor="rgba(0, 0, 0, 0.1)"
                                mt={1}
                            >
                                <CheckIcon boxSize={2.5} color="white" />
                            </Tooltip>
                            <Text fontSize={"xs"} fontWeight={500} color={"white"}>
                                BOT
                            </Text>
                        </Flex>
                        <Tooltip
                            label={`Today at ${new Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "numeric"
                            }).format(new Date())}`}
                            bg="#5961ec !important"
                            color={"white"}
                            p={1}
                            px={3}
                            rounded={"md"}
                            hasArrow
                            arrowSize={6}
                            arrowShadowColor={"rgba(0, 0, 0, 0.1)"}
                            mt={0.5}
                        >
                            <Text fontSize={"xs"} opacity={1}>
                                Today at{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                    hour: "numeric",
                                    minute: "numeric"
                                }).format(new Date())}
                            </Text>
                        </Tooltip>
                    </HStack>
                    {message.content && <Text>{content}</Text>}
                </Flex>

                <EmbedPreview message={message} />
            </Flex>
        </Flex>
    );
}
