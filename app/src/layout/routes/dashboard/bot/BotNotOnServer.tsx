import Link from "@/layout/global/Link";
import DiscordIcon from "@/layout/global/icons/DiscordIcon";
import config from "@/utils/config";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Link as ChakraLink, Heading, Image, Stack, VStack } from "@chakra-ui/react";

export default function BotNotOnServer() {
    return (
        <VStack w="100%" spacing={5}>
            <Image boxSize={"60"} alt="crying wumpus" src="/wumpussad.gif" />
            <Heading fontSize={"3xl"}>Sadly, our bot is not on this server.</Heading>
            <Stack
                direction={{
                    base: "column",
                    md: "row"
                }}
            >
                <Button
                    as={Link}
                    prefetch="render"
                    to="/dashboard/bot"
                    _hover={{ textDecor: "none", bg: "alpha100" }}
                    bg="alpha200"
                    leftIcon={<ArrowBackIcon />}
                >
                    Go back to dashboard
                </Button>
                <Button
                    as={ChakraLink}
                    target="_blank"
                    href={config.discordBotInvite}
                    _hover={{ textDecor: "none" }}
                    variant="brand"
                    leftIcon={<DiscordIcon />}
                >
                    Add the bot to your server
                </Button>
            </Stack>
        </VStack>
    );
}
