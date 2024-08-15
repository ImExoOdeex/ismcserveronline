import { authenticator } from "@/.server/auth/authenticator";
import {
    Info,
    sendCommentWebhook,
    sendDeleteCommentWebhook,
    sendReportWebhook
} from "@/.server/auth/webhooks";
import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { getServerInfo } from "@/.server/functions/api.server";
import { requireEnv } from "@/.server/functions/env.server";
import { cachePrefetchHeaders } from "@/.server/functions/fetchHelpers.server";
import { addressesConfig } from "@/.server/functions/validateServer";
import type { MinecraftImage } from "@/.server/minecraftImages";
import { getRandomMinecarftImage } from "@/.server/minecraftImages";
import { getCookieWithoutDocument } from "@/functions/cookies";
import { getFullFileUrl } from "@/functions/storage";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useEventSourceCallback from "@/hooks/useEventSourceCallback";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import type { ICheck } from "@/layout/routes/server/index/ChecksTable";
import ChecksTable from "@/layout/routes/server/index/ChecksTable";
import Comments from "@/layout/routes/server/index/Comments";
import CommentsSkeleton from "@/layout/routes/server/index/CommentsSkeleton";
import McFonts from "@/layout/routes/server/index/McFonts";
import MoreLikeThisServer from "@/layout/routes/server/index/MoreLikeThisServer";
import Motd from "@/layout/routes/server/index/Motd";
import ServerInfo from "@/layout/routes/server/index/ServerInfo";
import ServerView from "@/layout/routes/server/index/ServerView";
import type { tabs } from "@/layout/routes/server/index/Tabs";
import Tabs from "@/layout/routes/server/index/Tabs";
import UnderServerView from "@/layout/routes/server/index/UnderServerView";
import Widget from "@/layout/routes/server/index/Widget";
import type {
    AnyServer,
    AnyServerModel,
    BedrockServer,
    JavaServer,
    MinecraftServer
} from "@/types/minecraftServer";
import config from "@/utils/config";
import {
    Alert,
    AlertIcon,
    CloseButton,
    Divider,
    Flex,
    HStack,
    Heading,
    Icon,
    Stack,
    Text,
    VStack,
    VisuallyHidden,
    useToast
} from "@chakra-ui/react";
import { Prisma } from "@prisma/client";
import type {
    ActionFunctionArgs,
    HeadersArgs,
    LinksFunction,
    LoaderFunctionArgs,
    MetaArgs,
    MetaFunction
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Await, type ShouldRevalidateFunction } from "@remix-run/react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BiBug, BiInfoCircle } from "react-icons/bi";
import { type UseDataFunctionReturn, typeddefer, typedjson } from "remix-typedjson";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { InsideErrorBoundary } from "~/document";

export const handle = {
    hasCustomOgs: true
};

export function links() {
    return [
        {
            rel: "preload",
            href: "/Minecraft.otf",
            as: "font",
            type: "font/otf",
            crossOrigin: "anonymous"
        }
    ] as ReturnType<LinksFunction>;
}

export async function action({ request, params }: ActionFunctionArgs) {
    const form = await request.formData();
    const action = form.get("action");

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    switch (action) {
        case "query":
            throw redirect("?query");
        case "comment": {
            const content = form.get("content")?.toString();
            const server = params.server!.toString().toLowerCase();

            const serverId = (await db.server.findFirst({
                where: {
                    server: server,
                    bedrock
                }
            }))!.id;

            const user = await getUser(request, {
                nick: true,
                photo: true,
                id: true,
                email: true
            });
            if (!user) throw new Error("User is not logged!");

            try {
                if (!content) throw new Error("Content is not definied!");
                if (content.trim().length < 2) throw new Error("Content is too short!");
                if (content.trim().length > 350) throw new Error("Content is too long!");

                const hasCommented = await db.comment.findFirst({
                    where: {
                        user_id: user.id,
                        server_id: serverId
                    }
                });
                if (hasCommented) throw new Error("You have already commented on this server!");

                // allow user to comment only 10 times per day.
                const comments = await db.comment.findMany({
                    where: {
                        user_id: user.id,
                        created_at: {
                            gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                        }
                    }
                });
                if (comments.length >= 10)
                    throw new Error("You have reached the limit of comments per day!");
            } catch (e: any) {
                return typedjson({
                    error: e.message
                });
            }

            const newComment = await db.comment.create({
                data: {
                    content,
                    server_id: serverId,
                    user_id: user.id
                }
            });

            sendCommentWebhook(user, content, server, new Info(request.headers));

            return typedjson({
                success: true,
                comment: {
                    id: newComment.id,
                    content,
                    created_at: newComment.created_at,
                    updated_at: newComment.updated_at,
                    user: {
                        nick: user.nick,
                        photo: user.photo,
                        id: user.id
                    }
                }
            });
        }
        case "edit": {
            const content = form.get("content")?.toString();
            const id = form.get("id")?.toString();
            const server = params.server!.toString().toLowerCase();

            const serverId = (await db.server.findFirst({
                where: {
                    server: server,
                    bedrock
                }
            }))!.id;

            const user = await getUser(request);
            if (!user) throw new Error("User is not logged!");

            try {
                if (!content) throw new Error("Content is not definied!");
                if (content.trim().length < 5) throw new Error("Content is too short!");
                if (content.trim().length > 250) throw new Error("Content is too long!");
                if (!id) throw new Error("ID is not definied!");

                const comment = await db.comment.findFirst({
                    where: {
                        id: Number(id),
                        server_id: serverId
                    }
                });
                if (!comment) throw new Error("Comment is not found!");

                if (comment.user_id !== user.id)
                    throw new Error("You are not owner of this comment!");
            } catch (e: any) {
                return typedjson({
                    error: e.message
                });
            }

            const newComment = await db.comment.update({
                where: {
                    id: Number(id)
                },
                data: {
                    content: content
                }
            });

            return typedjson({
                success: true,
                comment: {
                    id: newComment.id,
                    content,
                    created_at: newComment.created_at,
                    updated_at: newComment.updated_at,
                    user: {
                        nick: user.nick,
                        photo: user.photo,
                        id: user.id
                    }
                }
            });
        }
        case "delete": {
            const id = form.get("id")?.toString();
            const server = params.server!.toString().toLowerCase();

            const serverId = (await db.server.findFirst({
                where: {
                    server: server,
                    bedrock
                }
            }))!.id;

            const user = await getUser(request);
            if (!user) throw new Error("User is not logged!");

            try {
                if (!id) throw new Error("ID is not definied!");

                const comment = await db.comment.findFirst({
                    where: {
                        id: Number(id),
                        server_id: serverId
                    }
                });
                if (!comment) throw new Error("Comment is not found!");

                if (comment.user_id !== user.id)
                    throw new Error("You are not owner of this comment!");
            } catch (e: any) {
                return typedjson({
                    error: e?.message,
                    success: false
                });
            }

            const deletedComment = await db.comment.delete({
                where: {
                    id: Number(id)
                }
            });

            sendDeleteCommentWebhook(
                user,
                deletedComment.content,
                server,
                new Info(request.headers)
            );

            return typedjson({
                success: true
            });
        }
        case "report": {
            const id = form.get("id")?.toString();
            const server = params.server!.toString().toLowerCase();

            const serverId = (await db.server.findFirst({
                where: {
                    server: server,
                    bedrock
                }
            }))!.id;

            const user = await getUser(request);
            if (!user) throw new Error("User is not logged!");

            try {
                if (!id) throw new Error("ID is not definied!");

                const comment = await db.comment.findFirst({
                    where: {
                        id: Number(id),
                        server_id: serverId
                    }
                });
                if (!comment) throw new Error("Comment is not found!");

                if (comment.user_id === user.id)
                    throw new Error("You can't report your own comment!");

                await sendReportWebhook(user, comment, server, new Info(request.headers));
            } catch (e: any) {
                return typedjson({
                    error: e?.message,
                    success: false
                });
            }

            return typedjson({
                success: true
            });
        }
        case "save": {
            const server = params.server!.toString().toLowerCase();

            const serverId = (await db.server.findFirst({
                where: {
                    server: server,
                    bedrock
                }
            }))!.id;

            const user = await getUser(request);
            if (!user) throw new Error("User is not logged!");

            try {
                const hasSaved = await db.savedServer.findFirst({
                    where: {
                        user_id: user.id,
                        server_id: serverId
                    }
                });
                if (hasSaved) {
                    await db.savedServer.delete({
                        where: {
                            id: hasSaved.id
                        }
                    });
                } else {
                    await db.savedServer.create({
                        data: {
                            server_id: serverId,
                            user_id: user.id
                        }
                    });
                }
            } catch (e: any) {
                return typedjson({
                    error: e.message
                });
            }

            return typedjson({
                success: true
            });
        }
        default: {
            throw new Error("Action is not definied!");
        }
    }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    const server = params.server?.toString().toLowerCase().trim();

    if (
        !server ||
        addressesConfig.invalidEndings.some((ending) => server.endsWith(ending)) ||
        server.length > addressesConfig.maxLength ||
        server.length < addressesConfig.minLength ||
        !addressesConfig.isValidServerAddress(server) ||
        server === "favicon.ico"
    ) {
        throw new Response("Not found", {
            status: 404
        });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("query") === "";

    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const port = server?.split(":")[1];
    // if port is 25565 redirect to server without port.
    if (port && port === (bedrock ? "19132" : "25565")) {
        throw redirect(`/${bedrock ? "bedrock/" : ""}${server.split(":")[0]}`);
    }

    let foundServer = (await db.server.findFirst({
        where: {
            server,
            bedrock
        },
        select: {
            id: true,
            server: true,
            bedrock: true,
            online: true,
            players: true,
            host: true,
            language: true,
            port: true,
            protocol: true,
            motd: true,
            version: true,
            banner: true,
            background: true,
            Tags: true,
            software: true,
            favicon: true,
            ping: true,
            edition: true,
            gamemode: true,
            guid: true,
            ip: true,
            plugins: true,
            owner_id: true,
            map: true
        }
    })) as unknown as AnyServerModel | null;

    const commentsPromise = foundServer
        ? db.comment.findMany({
              where: {
                  server_id: foundServer.id
              },
              select: {
                  id: true,
                  content: true,
                  created_at: true,
                  updated_at: true,
                  user: {
                      select: {
                          nick: true,
                          photo: true,
                          id: true
                      }
                  }
              },
              orderBy: {
                  created_at: "desc"
              }
          })
        : null;
    const comments = new Promise<NonNullable<typeof commentsPromise>>((r) => {
        // await new Promise((re) => setTimeout(re, 1000));
        r(commentsPromise || ([] as any));
    });

    let data = !foundServer
        ? await getServerInfo(server, query, bedrock)
        : getServerInfo(server, query, bedrock).then(async (res) => {
              // using Prisma.DbNull, to null out JSON fields, since null is not allowed in JSON fields.
              await db.server.update({
                  where: {
                      id: foundServer?.id
                  },
                  data: {
                      online: res.online,
                      players: res.players,
                      motd: res.motd,
                      version: res.version ?? undefined,
                      software: bedrock ? null : (res as JavaServer).software,
                      protocol: res.protocol,
                      host: res.host,
                      port: bedrock ? (res as BedrockServer).port.ipv4 : (res as JavaServer).port,

                      // java only
                      favicon: bedrock ? null : (res as JavaServer).favicon,
                      ping: bedrock ? null : (res as MinecraftServer).ping,

                      // bedrock stuff
                      edition: bedrock ? (res as BedrockServer).edition : null,
                      gamemode: bedrock ? (res as BedrockServer).gamemode : Prisma.DbNull,
                      guid: bedrock ? (res as BedrockServer).guid : null,

                      // query stuff
                      ip: query ? (res as MinecraftServer).ip : null,
                      plugins: query ? (res as MinecraftServer).plugins : Prisma.DbNull,
                      map: query ? (res as MinecraftServer).map : null
                  }
              });

              if (!blockTracking && data) {
                  const IP = getClientIPAddress(request.headers);

                  const token_id = (
                      await db.token.findUnique({
                          where: {
                              token: requireEnv("API_TOKEN")
                          }
                      })
                  )?.id;
                  if (!token_id) throw new Error("There's no valid API token!");

                  // dont create new check if there's already few checks in last 5 minutes from this IP.
                  const checks = await db.check.findMany({
                      where: {
                          server_id: foundServer?.id,
                          checked_at: {
                              gte: dayjs().subtract(5, "minutes").toDate()
                          },
                          client_ip: IP
                      }
                  });

                  if (checks.length < 5) {
                      await db.check.create({
                          data: {
                              server_id: serverId,
                              online: res.online,
                              players: res.players.online,
                              source: "WEB",
                              client_ip: IP,
                              token_id: token_id
                          }
                      });
                  }
              }

              return res;
          });

    const cookie = getCookieWithoutDocument("tracking", request.headers.get("cookie") ?? "");
    const blockTracking = cookie === "no-track";

    if (!foundServer) {
        data = data as AnyServer;
        foundServer = (await db.server.create({
            data: {
                server,
                bedrock,

                online: data.online,
                players: data.players,
                host: data.host,
                port: bedrock ? (data as BedrockServer).port.ipv4 : (data as JavaServer).port,
                protocol: data.protocol,
                motd: data.motd,
                version: data.version || Prisma.DbNull,
                software: bedrock ? null : (data as JavaServer).software,

                // java only
                favicon: bedrock ? null : (data as JavaServer).favicon,
                ping: bedrock ? null : (data as MinecraftServer).ping,

                // bedrock stuff
                edition: bedrock ? (data as BedrockServer).edition : null,
                gamemode: bedrock ? (data as BedrockServer).gamemode : Prisma.DbNull,
                guid: bedrock ? (data as BedrockServer).guid : null,

                // query stuff
                ip: query ? (data as MinecraftServer).ip : null,
                plugins: query ? (data as MinecraftServer).plugins : Prisma.DbNull,
                map: query ? (data as MinecraftServer).map : null
            }
        })) as unknown as AnyServerModel;
    }

    const serverId = foundServer.id;

    const user = await authenticator.isAuthenticated(request);
    const [votes, isSaved] = await Promise.all([
        db.vote.count({
            where: {
                server_id: serverId,
                created_at: {
                    gte: dayjs().startOf("month").toDate()
                }
            }
        }),
        user
            ? db.savedServer
                  .findFirst({
                      where: {
                          server_id: serverId,
                          user_id: user.id
                      }
                  })
                  .then((s) => !!s)
            : false
    ]);

    const image = foundServer.banner
        ? ({
              name: "Server banner",
              url: getFullFileUrl(foundServer.banner, "banner"),
              credits: ""
          } as MinecraftImage)
        : getRandomMinecarftImage();

    const ipRegexWithPortOptional = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?$/;
    const isIpOnly = ipRegexWithPortOptional.test(server);

    return typeddefer(
        {
            server,
            data,
            query,
            isSaved,
            foundServer,
            bedrock,
            serverId,
            image,
            votes,
            comments,
            isIpOnly,
            hideIpAlert:
                getCookieWithoutDocument(
                    "ip-only-alert-hidden",
                    request.headers.get("cookie") ?? ""
                ) === "true"
        },
        {
            headers: {
                "Cache-Control": "public, max-age=2, s-maxage=2",
                Vary: "Cookie",
                ...(cachePrefetchHeaders(request) || ({} as Headers))
            }
        }
    );
}

export function headers({ loaderHeaders }: HeadersArgs) {
    const cache = loaderHeaders.get("Cache-Control");

    const headers = new Headers();
    if (cache) headers.set("Cache-Control", cache);

    return headers;
}

export function meta({ data, matches }: MetaArgs & { data: UseDataFunctionReturn<typeof loader> }) {
    const aspectRatio = 4 / 1;
    const width = 1920;
    const height = width / aspectRatio;

    return [
        {
            title: data
                ? data.server + "'s status | IsMcServer.online"
                : "Server not found | IsMcServer.online"
        },
        {
            name: "og:title",
            content: data
                ? data.server + "'s status | IsMcServer.online"
                : "Server not found | IsMcServer.online"
        },
        {
            name: "og:description",
            content: data
                ? `Check ${data.server}'s status, players, motd, version and more!`
                : "Server not found | IsMcServer.online"
        },
        {
            name: "og:image",
            content: data
                ? `${config.dashUrl}/${data.bedrock ? "bedrock/" : ""}${data.server}/widget`
                : `${config.dashUrl}/logo-wallpaper.png`
        },
        {
            property: "og:image:width",
            content: width
        },
        {
            property: "og:image:height",
            content: height
        },
        {
            name: "og:url",
            content: data
                ? `${config.dashUrl}/${data.bedrock ? "bedrock/" : ""}${data.server}`
                : config.dashUrl
        },
        {
            name: "keywords",
            content: `${data.server} status, status for ${data.server}, ${data.server} server status, ${data.server} server live data, ${data.server} info, ${data.server} data, ${data.server} Minecraft server, ${data.server} Minecraft server status, ${data.server} mc server rewiew`
        },
        ...matches[0].meta
    ] as ReturnType<MetaFunction>;
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
    formData,
    currentParams,
    nextParams
}) => {
    if (currentParams.server !== nextParams.server) return true;
    if (!formData) return false;
    if (formData.get("action") === "query") return true;

    return false;
};

export default function $server() {
    const {
        server,
        image,
        query,
        isSaved,
        bedrock,
        serverId,
        hideIpAlert,
        isIpOnly,
        votes: dbVotes,
        comments: commentsPromise,
        data: promiseData, // data is there promise data, cause it's streaming, so "foundServer" is a data rn.
        foundServer: data
    } = useAnimationLoaderData<typeof loader>();

    const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("comments");
    const [comments, setComments] = useState<any[] | null>(null);

    const [votes, setVotes] = useState<number>(dbVotes);
    const toast = useToast();
    useEventSourceCallback(
        `/api/sse/vote?id=${serverId}`,
        {
            event: "new-vote"
        },
        (sourceData) => {
            toast({
                description: `${sourceData.nick} has voted for ${data.server}!`,
                status: "info",
                containerStyle: {
                    fontWeight: 500
                },
                isClosable: false
            });

            setVotes((v) => v + 1);
        }
    );

    const user = useUser();
    const isOwner = useMemo(() => {
        if (!user) return false;
        if (!data?.owner_id) return false;
        return user.id === data.owner_id;
    }, [data, user]);

    const [shouldPregenerateStyles, setShouldPregenerateStyles] = useState(true);
    // biome-ignore lint/correctness/useExhaustiveDependencies: no
    useEffect(() => {
        setShouldPregenerateStyles(false);
        console.log("Server Id", serverId);
    }, [server]);

    // checks table data
    // skip elements state (step by 20)
    const [doneInit, setDoneInit] = useState(false);
    const [skip, setSkip] = useState(0);
    const [checks, setChecks] = useState<ICheck[] | null>(null);

    const [ipOnlyAlertShown, setIpOnlyAlertShown] = useState(!hideIpAlert);

    return (
        <Flex gap={5} flexDir={"column"} maxW="1000px" mx="auto" w="100%" mt={"50px"} px={4} mb={5}>
            <div>
                <AnimatePresence mode="wait">
                    {isIpOnly && ipOnlyAlertShown && (
                        <motion.div
                            style={{
                                overflow: "hidden"
                            }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{
                                height: 0,
                                opacity: 0,
                                scale: 0.95
                            }}
                            transition={{
                                duration: 0.3,
                                ease: config.ease
                            }}
                        >
                            <Alert
                                status="warning"
                                mb={10}
                                justifyContent={"space-between"}
                                alignItems={"center"}
                            >
                                <HStack>
                                    <AlertIcon />
                                    <Text fontWeight={500}>
                                        IP only servers are excluded from server list
                                    </Text>
                                </HStack>
                                <CloseButton
                                    onClick={() => {
                                        setIpOnlyAlertShown(false);
                                        document.cookie =
                                            "ip-only-alert-hidden=true; path=/; max-age=31536000";
                                    }}
                                />
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {shouldPregenerateStyles && (
                <VisuallyHidden>
                    {/* pregenerate styles, cause emotion sucks */}
                    <ServerView
                        verified={!!data.owner_id}
                        server={server}
                        data={data as unknown as AnyServer}
                        bedrock={bedrock}
                        image={image}
                        mb={{
                            base: 32,
                            md: 28
                        }}
                    />
                    <Motd motd={data?.motd?.html} />
                    <ServerInfo bedrock={bedrock} data={data} query={query} server={server} />
                </VisuallyHidden>
            )}

            <Flex w="100%" flexDir={"column"} gap={2}>
                <Suspense
                    fallback={
                        <ServerView
                            verified={!!data.owner_id}
                            server={server}
                            data={data as unknown as AnyServer}
                            bedrock={bedrock}
                            image={image}
                            mb={{
                                base: 32,
                                md: 28
                            }}
                        />
                    }
                >
                    <Await resolve={promiseData}>
                        {(freshData) => (
                            <ServerView
                                verified={!!data.owner_id}
                                server={server}
                                data={freshData}
                                bedrock={bedrock}
                                image={image}
                                mb={{
                                    base: 32,
                                    md: 28
                                }}
                            />
                        )}
                    </Await>
                </Suspense>

                <McFonts />

                {/* displaying motd */}
                <Suspense fallback={data.online ? <Motd motd={data?.motd?.html} /> : <></>}>
                    <Await resolve={promiseData}>
                        {(freshData) => <Motd motd={freshData.motd?.html} />}
                    </Await>
                </Suspense>
            </Flex>

            <Divider />

            <UnderServerView
                voteCount={votes}
                server={server}
                bedrock={bedrock}
                promiseData={
                    promiseData instanceof Promise ? promiseData : Promise.resolve(promiseData)
                }
                isOwner={isOwner}
                verified={!!data.owner_id}
            />

            <Suspense
                fallback={
                    <ServerInfo server={server} data={data} bedrock={bedrock} query={query} />
                }
            >
                <Await resolve={promiseData}>
                    {(freshData) => (
                        <ServerInfo
                            server={server}
                            data={freshData}
                            bedrock={bedrock}
                            query={query}
                        />
                    )}
                </Await>
            </Suspense>

            <Divider />

            <Tabs tab={tab} setTab={setTab} isSaved={isSaved} />

            {tab === "checks" && (
                <VStack align={"start"} w="100%">
                    <Heading as={"h2"} fontSize="lg">
                        Last checks
                    </Heading>

                    <ChecksTable
                        server={server}
                        serverId={serverId}
                        checks={checks}
                        setChecks={setChecks}
                        skip={skip}
                        setSkip={setSkip}
                        doneInit={doneInit}
                        setDoneInit={setDoneInit}
                    />
                </VStack>
            )}
            {tab === "comments" && (
                <Suspense fallback={<CommentsSkeleton />}>
                    <Await resolve={commentsPromise}>
                        {(freshComments) => (
                            <Comments
                                freshComments={freshComments}
                                comments={comments}
                                setComments={setComments}
                                bedrock={bedrock}
                                server={server}
                            />
                        )}
                    </Await>
                </Suspense>
            )}

            <Widget />

            <MoreLikeThisServer
                server={server}
                players={data?.players.online}
                bedrock={bedrock}
                language={data.language}
                my={10}
            />

            <Stack direction={{ base: "column", md: "row" }} spacing={{ base: "auto", md: 7 }}>
                <HStack
                    as={"a"}
                    target={"_blank"}
                    href="https://github.com/ImExoOdeex/ismcserveronline/issues"
                    color={"textSec"}
                    fontWeight={500}
                    _hover={{ textDecor: "none", color: "initial" }}
                >
                    <Text>Found bug?</Text>
                    <Icon as={BiBug} />
                </HStack>
                <HStack
                    as={Link}
                    to="/faq"
                    color={"textSec"}
                    fontWeight={500}
                    _hover={{ textDecor: "none", color: "initial" }}
                >
                    <Text>Frequently asked questions</Text>
                    <Icon as={BiInfoCircle} />
                </HStack>
            </Stack>
        </Flex>
    );
}

export function ErrorBoundary() {
    return (
        <Flex flex={1} alignItems={"center"} justifyContent={"center"}>
            <InsideErrorBoundary />
        </Flex>
    );
}
