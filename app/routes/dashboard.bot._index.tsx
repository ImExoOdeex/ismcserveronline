import { getUser } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import config from "@/utils/config";
import {
    Badge,
    Button,
    Divider,
    Flex,
    HStack,
    Heading,
    Icon,
    Image,
    LightMode,
    SimpleGrid,
    Text,
    VStack
} from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { memo } from "react";
import { HiRefresh } from "react-icons/hi";
import { typedjson } from "remix-typedjson";

export interface Guild {
    id: string;
    name: string;
    icon?: string;
    owner: boolean;
    permissions: number;
    features: string[];
    permissions_new: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);
    const userWithGuilds = await getUser(request, {
        guilds: true
    });
    if (!userWithGuilds) {
        throw redirect("/relog");
    }
    const guilds = userWithGuilds.guilds as unknown as Guild[];

    if (typeof guilds !== "object") {
        throw new Error("'Guilds' is not an object!");
    }

    return typedjson({ guilds }, cachePrefetch(request));
}

export default function Index() {
    const { guilds } = useAnimationLoaderData<typeof loader>();

    const refreshGuildsFetcher = useFetcher();

    return (
        <VStack w="100%" align={"start"} spacing={4}>
            <VStack align="start" w="100%">
                <Heading fontSize={"2xl"} fontWeight={600}>
                    Servers, that you can manage
                </Heading>
                <Text>
                    There's a list of all your servers, that you can manage. Click of any you want
                    to configure the bot!
                </Text>

                <Divider />
            </VStack>

            <VStack w="100%" align={"start"} spacing={10}>
                {guilds.length ? (
                    <SimpleGrid
                        w="100%"
                        minChildWidth={{ base: "100%", md: "calc(33.333333% - 20px)" }}
                        spacing={5}
                    >
                        {guilds
                            .filter((guild: Guild) => (guild.permissions & 0x20) === 0x20)
                            .sort((a: Guild, b: Guild) => {
                                if (a.owner === true && b.owner !== true) {
                                    return -1;
                                }if (b.owner === true && a.owner !== true) {
                                    return 1;
                                }
                                    return 0;
                            })
                            .map((guild) => (
                                <OneServer key={guild.id} guild={guild} />
                            ))}
                    </SimpleGrid>
                ) : (
                    <Heading
                        fontSize={"xl"}
                        textAlign={"center"}
                        w="100"
                        alignSelf={"center"}
                        py={10}
                        color="red"
                    >
                        Sadly, you don't manage any servers :(
                    </Heading>
                )}
                <HStack>
                    <refreshGuildsFetcher.Form action="/api/auth/discord/reauthenticate">
                        <Button
                            transform={"auto-gpu"}
                            _active={{ scale: 0.9 }}
                            isLoading={refreshGuildsFetcher.state !== "idle"}
                            type="submit"
                            variant={"brand"}
                        >
                            <HStack>
                                <Icon as={HiRefresh} />
                                <Text>Refresh guilds</Text>
                            </HStack>
                        </Button>
                    </refreshGuildsFetcher.Form>
                </HStack>
            </VStack>
        </VStack>
    );
}

const OneServer = memo(function OneServer({ guild }: { guild: Guild }) {
    return (
        <Flex
            rounded={"xl"}
            w="100%"
            p={4}
            overflow={"hidden"}
            gap={2}
            pos="relative"
            as={Link}
            to={`/dashboard/bot/${guild.id}`}
            transform={"auto-gpu"}
            _hover={{
                textDecoration: "none"
            }}
            _active={{
                scale: 0.95
            }}
            transition={`transform 0.2s ${config.cubicEase}`}
        >
            <Image
                pos={"absolute"}
                top={0}
                right={0}
                left={0}
                bottom={0}
                w="100%"
                h="100%"
                objectFit="cover"
                filter={"blur(25px)"}
                alt="background"
                zIndex={-1}
                src={
                    guild?.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`
                        : "/banner.jpg"
                }
            />

            <Image
                // border={"2px solid white"}
                rounded={"md"}
                src={
                    guild?.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`
                        : "/discordLogo.png"
                }
                alt={guild.name + "'s name"}
                boxSize={12}
            />
            <Flex flexDir={"column"}>
                <Text
                    fontWeight={600}
                    fontSize={"xl"}
                    color={"white"}
                    noOfLines={1}
                    textShadow={"0px 0px 2px #000000"}
                >
                    {guild.name}
                </Text>
                <LightMode>
                    {guild.owner ? (
                        <Badge colorScheme="green" w="fit-content">
                            Admin
                        </Badge>
                    ) : (
                        <Badge colorScheme="brand" w="fit-content">
                            Mod
                        </Badge>
                    )}
                </LightMode>
            </Flex>
            {/* {(guild.permissions & 0x20) == 0x20 ? "lmaooooooooooo" : "NOP"} */}
        </Flex>
    );
});
