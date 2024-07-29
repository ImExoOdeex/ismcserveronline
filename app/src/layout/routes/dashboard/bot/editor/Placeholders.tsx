import type { DiscordMessageType } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import config from "@/utils/config";
import {
    Code,
    type CodeProps,
    Divider,
    Flex,
    Heading,
    ListItem,
    Text,
    UnorderedList,
    useColorModeValue
} from "@chakra-ui/react";
import React, { useMemo } from "react";

interface Props {
    type: DiscordMessageType;
}

export interface Placeholder {
    name: string;
    placeholder: string;
    replaceWith?: string;
    isMention?: boolean;
}

const mentions = [
    {
        name: "@user",
        placeholder: "<@USER_ID>",
        isMention: true
    },
    {
        name: "@role",
        placeholder: "<@&ROLE_ID>",
        isMention: true
    },
    {
        name: "@everyone",
        placeholder: "@everyone",
        isMention: true
    },
    {
        name: "@channel",
        placeholder: "<#CHANNEL_ID>",
        isMention: true
    }
];

export const placeholders = {
    livecheck: [
        {
            name: "Server",
            placeholder: "{server}"
        },
        {
            name: "Server Icon",
            placeholder: "{favicon}",
            replaceWith:
                "https://cdn.discordapp.com/icons/1066548001025310730/9255d155f58573ad7d4fdd6cd497fdbc.webp"
        },
        {
            name: "Status Icon",
            placeholder: "{icon}"
        },
        {
            name: "Server Status",
            placeholder: "{status}"
        },
        {
            name: "Motd",
            placeholder: "{motd}"
        },
        {
            name: "Players",
            placeholder: "{players}"
        },
        {
            name: "Max Players",
            placeholder: "{maxPlayers}"
        },
        ...mentions
    ],
    alert: [
        {
            name: "Server",
            placeholder: "{server}"
        },
        {
            name: "Date and Time",
            placeholder: "{datetime}"
        },
        ...mentions
    ]
} as Record<DiscordMessageType, Placeholder[]>;

export default function Placeholders({ type }: Props) {
    const placeholdersType = useMemo(() => {
        return placeholders[type];
    }, [type]);

    const mentionBg = useColorModeValue("hsl(235 85.6% 64.7% / 0.8) !important", "#5057a3df");

    const mentionStyles = {
        bg: mentionBg,
        textColor: "white",
        _hover: { bg: "#5865f2" },
        cursor: "pointer",
        fontWeight: 500,
        px: 1,
        py: "1px",
        rounded: "sm",
        w: "max",
        fontFamily: "Montserrat",
        transition: `all 0.2s ${config.ease.join(", ")}`
    } as CodeProps;

    return (
        <Flex
            flexDir={"column"}
            bg="alpha"
            h="min"
            border={"1px solid"}
            borderColor="alpha300"
            rounded={"lg"}
            p={4}
            w={{
                base: "100%",
                md: 80
            }}
            gap={5}
        >
            <Heading fontWeight={600} textAlign={"center"} fontSize={"xl"}>
                Available Placeholders
            </Heading>

            <Flex flexDir={"column"} gap={2}>
                <Text fontWeight={"semibold"} color={"brand"}>
                    Placeholders
                </Text>

                <UnorderedList listStyleType={"none"} spacing={1.5} marginInlineStart={"0px"}>
                    {placeholdersType.map((pl) => (
                        <React.Fragment key={pl.placeholder}>
                            <Divider />
                            <ListItem>
                                <Flex flexDir={"column"} gap={0.5}>
                                    <Text {...(pl.isMention ? mentionStyles : {})}>{pl.name}</Text>
                                    <Code bg="transparent">{pl.placeholder}</Code>
                                </Flex>
                            </ListItem>
                        </React.Fragment>
                    ))}
                </UnorderedList>
            </Flex>
        </Flex>
    );
}
