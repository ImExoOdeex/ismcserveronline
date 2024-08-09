import { db } from "@/.server/db/db";
import cache from "@/.server/db/redis";
import { addressesConfig } from "@/.server/functions/validateServer";
import serverConfig from "@/.server/serverConfig";
import { getCookieWithoutDocument } from "@/functions/cookies";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import BotInfo from "@/layout/routes/index/BotInfo";
import HowToUse from "@/layout/routes/index/HowToUse";
import Main from "@/layout/routes/index/Main";
import PopularServers from "@/layout/routes/index/PopularServers";
import TopServers from "@/layout/routes/index/TopServers";
import WARWF from "@/layout/routes/index/WARWF";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Flex } from "@chakra-ui/react";
import type {
    ActionFunctionArgs,
    HeadersArgs,
    HeadersFunction,
    LoaderFunctionArgs,
    MetaArgs,
    MetaFunction
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import dayjs from "dayjs";
import { typedjson } from "remix-typedjson";
import type { SearchServer, SearchTag } from "~/routes/search";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const bedrock =
        getCookieWithoutDocument("version", request.headers.get("cookie") ?? "") === "bedrock";
    const server = formData.get("server")?.toString().toLowerCase().trim();
    if (!server) {
        return null;
    }

    if (addressesConfig.isValidServerAddress(server)) {
        return redirect(`/${bedrock ? "bedrock/" : ""}${server}`);
    }
    return redirect("/search?q=" + server);
}

export function headers(_: HeadersArgs) {
    const headers = new Headers();

    headers.append("Cache-Control", "public, s-maxage=3600");
    headers.append("Vary", "Cookie, Accept-Encoding");

    return headers satisfies ReturnType<HeadersFunction>;
}

export function meta({ matches }: MetaArgs) {
    return [
        {
            title: "#1 Minecraft server list & status checker"
        },
        ...matches[0].meta
    ] as ReturnType<MetaFunction>;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const cookies = request.headers.get("Cookie");
    const bedrock = getCookieWithoutDocument("bedrock", cookies ?? "") === "true";
    const query = getCookieWithoutDocument("query", cookies ?? "") === "true";

    let cookieLocale = getCookieWithoutDocument("locale", request.headers.get("Cookie") ?? "");
    cookieLocale = cookieLocale === "us" ? "en" : cookieLocale;
    // const locales = getClientLocales(request);
    const locale = "en";
    // locales
    //     ? locales[0].split("-")[0] === "us"
    //         ? "en"
    //         : locales[0].split("-")[0]
    //     : "en";

    // const url = new URL(request.url);
    // const spLocale = url.searchParams.get("lang");

    // let locale = spLocale || cookieLocale || locale;
    // locale = locale === "us" ? "en" : locale;

    const cacheServersKey = `servers-${bedrock}-hot-${locale}`;
    const cacheServersStr = await cache.get(cacheServersKey);
    const cacheServers = cacheServersStr ? JSON.parse(cacheServersStr) : null;
    const cacheTagsStr = await cache.get("tags");
    const cacheTags = cacheTagsStr ? JSON.parse(cacheTagsStr) : null;

    let servers: SearchServer[] = cacheServers || [];
    let tags: SearchTag[] = cacheTags || [];

    if (!cacheServers || !cacheTags) {
        const promises = [
            db.tag.findMany({
                take: 8,
                select: {
                    name: true
                },
                orderBy: {
                    servers: {
                        _count: "desc"
                    }
                }
            }) as Promise<SearchTag[]>,
            db.server.findMany({
                take: 4,
                select: {
                    id: true,
                    server: true,
                    bedrock: true,
                    favicon: true,
                    players: true,
                    prime: true,
                    motd: true,
                    description: true,
                    owner_id: true,
                    Owner: {
                        select: {
                            prime: true
                        }
                    },
                    Tags: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            Vote: {
                                where: {
                                    created_at: {
                                        gte: dayjs().startOf("month").toDate()
                                    }
                                }
                            }
                        }
                    }
                },
                where: {
                    AND: {
                        bedrock,
                        AND: {
                            OR: [
                                {
                                    language: locale === "en" ? "en" : locale
                                },
                                {
                                    language: locale === "en" ? null : locale
                                }
                            ]
                        },
                        server: {
                            startsWith: "%.%",
                            not: {
                                startsWith: "%.%.%.%"
                            }
                        },
                        online: true
                    }
                },
                orderBy: [
                    {
                        Vote: {
                            _count: "desc"
                        }
                    },
                    {
                        Check: {
                            _count: "desc" as const
                        }
                    }
                ]
            }) as unknown as Promise<SearchServer[]>
        ] as const;

        const [fetchedTags, fetchedServers] = await Promise.all(promises);
        servers = fetchedServers;
        tags = fetchedTags;

        const cacheTTL = serverConfig.cache.searchServersNTags;
        await Promise.all([
            cache.set(cacheServersKey, JSON.stringify(fetchedServers), cacheTTL),
            cache.set("tags", JSON.stringify(fetchedTags), cacheTTL)
        ]);
    }

    // promoted-bedrock-locale-tags
    const promotedServersCacheKey = `promoted-${bedrock}-${locale}`;
    const cachePromotedServersStr = await cache.get(promotedServersCacheKey);
    const cachePromotedServers = cachePromotedServersStr
        ? JSON.parse(cachePromotedServersStr)
        : null;

    let randomPromoted: { Server: SearchServer; color: string; id: number }[] =
        cachePromotedServers || [];

    if (!cachePromotedServers) {
        const promotedCount = await db.promoted.count({
            where: {
                Server: {
                    bedrock,
                    language: locale
                }
            }
        });
        const skip = Math.floor(Math.random() * promotedCount);
        randomPromoted = (await db.promoted.findMany({
            take: 2,
            select: {
                id: true,
                Server: {
                    select: {
                        id: true,
                        favicon: true,
                        server: true,
                        description: true,
                        bedrock: true,
                        players: true,
                        Tags: {
                            select: {
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                Vote: true
                            }
                        }
                    }
                },
                color: true
            },
            skip,
            where: {
                Server: {
                    bedrock,
                    language: locale
                },
                status: "Active"
            },
            orderBy: {
                created_at: "desc"
            }
        })) as any;

        await cache.set(
            promotedServersCacheKey,
            JSON.stringify(randomPromoted),
            serverConfig.cache.promotedServers
        );
    }

    return typedjson({ bedrock, query, servers, tags, randomPromoted });
}

export default function Index() {
    const { servers, randomPromoted, tags } = useAnimationLoaderData<typeof loader>();

    return (
        <Flex flexDir={"column"} w="100%" mt={20} mb={10} gap={20}>
            <Flex
                flexDir={"column"}
                maxW="1400px"
                mx="auto"
                w="100%"
                gap={20}
                px={4}
                minH={"calc(100vh - (70px + 80px + 80px))"}
                pos="relative"
                alignItems={"center"}
                justifyContent={"center"}
                pb={20}
            >
                <Main tags={tags} />

                <TopServers servers={servers} promoted={randomPromoted} />

                <ChevronDownIcon
                    boxSize={20}
                    color="brand.900"
                    pos="absolute"
                    bottom={-20}
                    left="50%"
                    transform="translateX(-50%)"
                />
            </Flex>

            <BotInfo />

            <Flex flexDir={"column"} maxW="1400px" mx="auto" w="100%" gap={20} px={4}>
                <Flex flexDir={"column"} gap={"28"} w="100%">
                    <HowToUse />
                    <PopularServers />
                    <WARWF />
                </Flex>
            </Flex>
        </Flex>
    );
}
