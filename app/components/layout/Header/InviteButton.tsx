import { HStack, Link, Text } from "@chakra-ui/react";
import links from "../../config/links.json"
import DiscordIcon from "../icons/DiscordIcon";

export default function InviteButton() {
    return (
        <Link _hover={{ textDecoration: "none", bg: "discord.900" }} h='40px' px={4} fontWeight={500} bg="discord.100" rounded={'xl'} color={'white'} alignItems={'center'} userSelect={"none"}
            transform={'auto-gpu'} _active={{ scale: .9 }}
            href={links.discordBotInvite}
        >
            <HStack h={"100%"} alignItems={'center'}>
                <DiscordIcon />
                <Text>
                    Invite bot
                </Text>
            </HStack>
        </Link>
    )
}