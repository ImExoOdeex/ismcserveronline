import { db } from "@/.server/db/db";
import { getUser, getUserId } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import type { MinecraftImage } from "@/.server/minecraftImages";
import { getRandomMinecarftImage } from "@/.server/minecraftImages";
import { decrypt } from "@/.server/modules/encryption";
import { sendVotePacket, sendVoteWebhook } from "@/.server/modules/voting";
import { getFullFileUrl } from "@/functions/storage";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import ServerView from "@/layout/routes/server/index/ServerView";
import LoginToVote from "@/layout/routes/server/vote/LoginToVote";
import MessageFromOwner from "@/layout/routes/server/vote/MessageFromOwner";
import Vote from "@/layout/routes/server/vote/Vote";
import type { AnyServer, AnyServerModel } from "@/types/minecraftServer";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Divider, Flex, VStack } from "@chakra-ui/react";
import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaArgs,
    MetaFunction
} from "@remix-run/node";
import dayjs from "dayjs";
import type { UseDataFunctionReturn } from "remix-typedjson";
import { typedjson } from "remix-typedjson";
import type { MultiEmitter } from "server/MultiEmitter";
import invariant from "tiny-invariant";
import { InsideErrorBoundary } from "~/document";

const votingHours = 12;

export const handle = {
    hasCustomOgs: true
};

export async function action({ request, params, context }: ActionFunctionArgs) {
    csrf(request);

    try {
        const user = await getUser(request);
        invariant(user, "You must be logged in to vote");

        const form = await request.formData();
        const nick = form.get("nick")?.toString().trim() as string;
        invariant(nick, "You must provide a Minecraft nickname");

        const server = params.server?.toString().toLowerCase();
        const url = new URL(request.url);
        const isBedrock = url.pathname.split("/")[1] === "bedrock";

        const foundServer = await db.server.findFirst({
            where: {
                server,
                bedrock: isBedrock
            },
            select: {
                id: true,
                server: true,
                vote_webhook_password: true,
                vote_webhook_url: true,
                prime: true,
                host: true,
                votifier_host: true,
                votifier_port: true,
                votifier_token: true,
                using_votifier: true,
                Owner: {
                    select: {
                        id: true,
                        prime: true
                    }
                }
            }
        });
        invariant(foundServer, "Server not found");

        // check if this user has already voted
        const userVote = await db.vote.findFirst({
            where: {
                server_id: foundServer.id,
                user_id: user.id,
                created_at: {
                    gte: dayjs().subtract(votingHours, "hour").toDate()
                }
            }
        });
        invariant(!userVote, "You have already voted for this server");

        // check if this nickname has already voted
        const nickVote = await db.vote.findFirst({
            where: {
                server_id: foundServer.id,
                nick,
                created_at: {
                    gte: dayjs().subtract(votingHours, "hour").toDate()
                }
            }
        });
        invariant(!nickVote, "This nickname has already voted");

        // Vote yes
        const vote = await db.vote.create({
            data: {
                server_id: foundServer.id,
                user_id: user.id,
                nick
            }
        });

        // create second vote if it's weekend and server or owner have prime or voting user has prime. weekend starts at 3pm on friday and ends at the end of sunday
        const day = dayjs().day();
        const hour = dayjs().hour();
        const isFriday = day === 5 && hour >= 15;
        const isWeekend = day === 6 || day === 0 || isFriday;

        if (isWeekend && (foundServer.prime || foundServer?.Owner?.prime || user.prime)) {
            await db.vote.create({
                data: {
                    server_id: foundServer.id,
                    user_id: user.id,
                    nick
                }
            });
        }

        if (foundServer.using_votifier && foundServer.votifier_token) {
            await sendVotePacket({
                host: foundServer.votifier_host || foundServer.server,
                port: foundServer.votifier_port,
                token: await decrypt(foundServer.votifier_token),
                nick
            }).catch((e) => {
                console.error("Failed to send votifier packet", e);
            });
        }

        await sendVoteWebhook(foundServer, {
            server: foundServer.server,
            bedrock: isBedrock,
            nick
        });

        try {
            const emitter = context.emitter as MultiEmitter;
            emitter.send(`vote-${foundServer.id}`, {
                id: vote.id,
                nick
            });
        } catch (e) {
            console.error("Failed to send vote event via emitter", e);
        }

        return typedjson(
            {
                success: true,
                vote
            },
            {
                headers: {
                    "Set-Cookie": `last-minecraft-nickname=${nick}; Path=/; Max-Age=${
                        60 * 60 * 24 * 365
                    }; SameSite=Strict`
                }
            }
        );
    } catch (e) {
        return typedjson({
            success: false,
            message: (e as Error).message
        });
    }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    const server = params.server?.toString().toLowerCase();
    if (!server?.includes("."))
        throw new Response("Not found", {
            status: 404
        });

    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const foundServer = (await db.server
        .findFirst({
            where: {
                server,
                bedrock
            }
        })
        .catch(() => null)) as unknown as AnyServerModel | null;

    if (!foundServer) {
        throw new Response("Not found", {
            status: 404
        });
    }

    const userId = await getUserId(request);
    // vote in last 12 hours
    const vote = userId
        ? await db.vote.findFirst({
              where: {
                  server_id: foundServer.id,
                  user_id: userId,
                  created_at: {
                      gte: dayjs().subtract(votingHours, "hours").toDate()
                  }
              }
          })
        : null;

    const image = foundServer.banner
        ? ({
              credits: "",
              name: foundServer.server + "'s banner",
              url: getFullFileUrl(foundServer.banner, "banner")
          } as MinecraftImage)
        : getRandomMinecarftImage();

    return typedjson(
        {
            data: foundServer,
            vote,
            image
        },
        cachePrefetch(request)
    );
}

export function meta({ data, matches }: MetaArgs) {
    return [
        {
            title: data
                ? "Vote for " +
                  (data as UseDataFunctionReturn<typeof loader>).data.server +
                  "! | IsMcServer.online"
                : "Server not found | IsMcServer.online"
        },
        ...matches[0].meta
    ] as ReturnType<MetaFunction>;
}

export function shouldRevalidate() {
    return false;
}

export default function ServerVote() {
    const { data, image } = useAnimationLoaderData<typeof loader>();
    const user = useUser();

    return (
        <VStack
            spacing={"40px"}
            align="start"
            maxW="1000px"
            mx="auto"
            w="100%"
            mt={"50px"}
            px={4}
            mb={5}
        >
            <Button
                leftIcon={<ArrowBackIcon />}
                as={Link}
                to={`/${data.bedrock ? "bedrock/" : ""}${data.server}`}
            >
                Go back
            </Button>
            <Flex w="100%" flexDir={"column"} gap={2}>
                <ServerView
                    server={data.server}
                    data={data as unknown as AnyServer}
                    verified={!!data.owner_id}
                    bedrock={data.bedrock}
                    image={image}
                    mb={{
                        base: 44,
                        md: 28
                    }}
                />
            </Flex>

            {user ? <Vote /> : <LoginToVote server={data.server} bedrock={data.bedrock} />}

            <Divider />

            <MessageFromOwner
                message={data?.message_from_owner}
                ownerId={data?.owner_id}
                server={data.server}
                bedrock={data.bedrock}
            />
        </VStack>
    );
}

export function ErrorBoundary() {
    return (
        <Flex flex={1} alignItems={"center"} justifyContent={"center"}>
            <InsideErrorBoundary />
        </Flex>
    );
}
