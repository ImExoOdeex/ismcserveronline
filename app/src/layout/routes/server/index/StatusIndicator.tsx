import type { FlexProps } from "@chakra-ui/react";
import { Box, Flex, Heading, useToken } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useMemo } from "react";

interface Props {
    online: boolean;
    onlineColor?: string;
    offlineColor?: string;
}

export default function StatusIndicator({
    online,
    onlineColor = "green",
    offlineColor = "red.500",
    ...props
}: Props & FlexProps) {
    [onlineColor, offlineColor] = useToken("colors", [onlineColor, offlineColor]);

    const boxShadowInfinityPulse = useMemo(() => {
        return keyframes({
            "0%": {
                boxShadow: `0px 0px 5px 2px ${online ? onlineColor : offlineColor}`
            },
            "100%": {
                boxShadow: `0px 0px 12px 6px ${online ? onlineColor : offlineColor}`
            }
        });
    }, [offlineColor, online, onlineColor]);

    return (
        <Flex
            gap={2}
            alignItems={"center"}
            pos="relative"
            py={2}
            px={4}
            rounded={"lg"}
            bg={online ? "rgba(0, 255, 17, 0.1)" : "rgba(255, 38, 0, 0.1)"}
            h="min-content"
            {...props}
        >
            <Box
                boxSize={3}
                rounded="full"
                bg={online ? onlineColor : offlineColor}
                animation={`${boxShadowInfinityPulse} 1s infinite alternate`}
                boxShadow={`0px 0px 5px ${onlineColor}`}
            />
            <Heading
                fontSize="lg"
                letterSpacing={"3px"}
                color={online ? onlineColor : offlineColor}
            >
                {online ? "Online" : "Offline"}
            </Heading>
        </Flex>
    );
}
