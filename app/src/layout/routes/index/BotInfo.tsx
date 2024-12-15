import useRootData from "@/hooks/useRootData";
import Link from "@/layout/global/Link";
import { Button, DarkMode, Flex, HStack, Heading, Image, Text } from "@chakra-ui/react";
import { BiAddToQueue } from "react-icons/bi";
import { TbLayoutDashboard } from "react-icons/tb";

export default function BotInfo() {
    const { discordClient } = useRootData();

    return (
        <Flex
            w="100%"
            flexDir={"column"}
            gap={10}
            pos={"relative"}
            color="whiteAlpha.900"
            py={12}
            bgGradient={"linear(to-r, brand.900, #dc69b4)"}
        >
            <DarkMode>
                <Flex flexDir={"column"} gap={10} mx="auto" w="100%" maxW="1400px" px={4}>
                    <Flex
                        w={"100%"}
                        justifyContent={"space-between"}
                        alignItems={"flex-start"}
                        flexDir={{
                            base: "column",
                            lg: "row"
                        }}
                        gap={4}
                    >
                        <Flex flexDir={"column"}>
                            <Heading as={"h3"} fontSize={"4xl"}>
                                Discord Bot
                            </Heading>
                            <Text as={"h4"} fontSize={"2xl"}>
                                Is Minecraft Server Online Bot
                            </Text>
                        </Flex>

                        <Flex
                            flexDir={"column"}
                            alignItems={{
                                base: "center",
                                lg: "flex-end"
                            }}
                            w={{
                                base: "100%",
                                lg: "auto"
                            }}
                            gap={1.5}
                        >
                            <Link
                                isExternal
                                aria-label="Vote on Top.gg"
                                to={`https://top.gg/bot/${discordClient}/vote`}
                                title={"Vote on Top.gg"}
                                display={"flex"}
                                alignItems={"center"}
                                gap={2}
                                _hover={{
                                    textDecoration: "none"
                                }}
                            >
                                <Flex opacity={0.75} fontWeight={600} gap={1}>
                                    Vote on
                                    <Image alt="Top.gg" boxSize={6} src="/topgg.svg" />
                                    .gg
                                </Flex>
                            </Link>
                        </Flex>
                    </Flex>

                    <Text color="whiteAlpha.800" fontSize={"lg"} fontWeight={500}>
                        Our Discord Bot allows checking the status of any Minecraft server
                        automatically every 30 seconds. It's customizable and easy to use via our
                        dashboard. Set up alerts to get notified when your server goes offline or
                        online. The bot is free to use and can be added to your server with a single
                        click.
                    </Text>

                    <HStack>
                        <Button
                            size="lg"
                            variant={"brand"}
                            as={Link}
                            to="/dashboard/bot"
                            rightIcon={<TbLayoutDashboard />}
                        >
                            Dashboard
                        </Button>
                        <Button
                            size="lg"
                            rightIcon={<BiAddToQueue />}
                            as={Link}
                            isExternal
                            to="/invite"
                        >
                            Invite to your server
                        </Button>
                    </HStack>
                </Flex>
            </DarkMode>
        </Flex>
    );
}
