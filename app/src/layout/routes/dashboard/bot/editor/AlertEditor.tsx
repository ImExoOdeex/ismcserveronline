import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import type { DiscordMessage } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import DiscordMessageEditor from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import config from "@/utils/config";
import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import type { Transition } from "framer-motion";
import { motion } from "framer-motion";
import { memo, useState } from "react";

interface Props {
    messages: [
        {
            ONLINE: DiscordMessage;
            OFFLINE: DiscordMessage;
        },
        {
            ONLINE: DiscordMessage;
            OFFLINE: DiscordMessage;
        }
    ];
    channels: Record<string, string>;
    roles: Record<string, string>;
}

export default memo(function AlertEditor({ channels, messages, roles }: Props) {
    const [onlineMessage, setOnlineMessage] = useState<DiscordMessage>(messages[1].ONLINE);
    const [offlineMessage, setOfflineMessage] = useState<DiscordMessage>(messages[1].OFFLINE);

    const { startAndDone } = useProgressBarContext();
    const fetcher = useDebouncedFetcherCallback((data) => {
        startAndDone();
        console.log("fetcher", data);
    });
    useInsideEffect(() => {
        fetcher.submit(
            {
                message: JSON.stringify(onlineMessage),
                type: "alert",
                status: "ONLINE"
            },
            {
                debounceTimeout: 1000,
                method: "PATCH"
            }
        );
    }, [onlineMessage]);

    useInsideEffect(() => {
        fetcher.submit(
            {
                message: JSON.stringify(offlineMessage),
                type: "alert",
                status: "OFFLINE"
            },
            {
                debounceTimeout: 1000,
                method: "PATCH"
            }
        );
    }, [offlineMessage]);

    const statuses = ["Online", "Offline"] as const;
    const [status, setStatus] = useState<(typeof statuses)[number]>("Offline");

    return (
        <>
            <Flex flexDir={"column"} w="100%" gap={4}>
                <HStack spacing={1}>
                    {statuses.map((s) => (
                        <Button
                            letterSpacing={1}
                            size="lg"
                            px={10}
                            key={s}
                            variant={"ghost"}
                            color="brand"
                            onClick={() => {
                                setStatus(s);
                            }}
                            rounded={"lg"}
                            _hover={{
                                bg:
                                    status === s
                                        ? "rgba(98, 42, 167, 0.05)"
                                        : "rgba(98, 42, 167, 0.2)"
                            }}
                            _active={{
                                bg:
                                    status === s
                                        ? "rgba(98, 42, 167, 0.1)"
                                        : "rgba(98, 42, 167, 0.3)"
                            }}
                            pos={"relative"}
                        >
                            {s}
                            {status === s && (
                                <Flex
                                    as={motion.div}
                                    layout
                                    layoutId="alert-status"
                                    transition={
                                        {
                                            duration: 0.3,
                                            ease: config.ease
                                        } as Transition as any
                                    }
                                    pos="absolute"
                                    rounded={"lg"}
                                    top={0}
                                    right={0}
                                    bottom={0}
                                    left={0}
                                    bg={"rgba(98, 42, 167,0.3)"}
                                />
                            )}
                        </Button>
                    ))}
                </HStack>

                <Text fontSize={"xl"} fontWeight={600}>
                    Alert custom message
                </Text>
                <DiscordMessageEditor
                    message={status === "Online" ? onlineMessage : offlineMessage}
                    setMessage={status === "Online" ? setOnlineMessage : setOfflineMessage}
                    type="alert"
                    data={{
                        guildData: {
                            channels,
                            roles
                        }
                    }}
                />
            </Flex>
        </>
    );
});
