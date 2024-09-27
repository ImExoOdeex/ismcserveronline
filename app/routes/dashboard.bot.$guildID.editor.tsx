import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import AlertEditor from "@/layout/routes/dashboard/bot/editor/AlertEditor";
import LivecheckEditor from "@/layout/routes/dashboard/bot/editor/LivecheckEditor";
import { Divider, Flex, Text, VStack, useToken } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export async function loader({ params, request }: LoaderFunctionArgs) {
    csrf(request);
    const guildID = params.guildID!;
    await requireUserGuild(request, guildID);

    const [messages, channels, roles] = await Promise.all([
        fetch(`${serverConfig.botApi}/${guildID}/custom-messages`, {
            method: "GET",
            headers: {
                Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
            }
        }).then((res) => res.json()),
        fetch(`${serverConfig.botApi}/${guildID}/channels`, {
            method: "GET",
            headers: {
                Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
            }
        }).then((res) => res.json()),
        fetch(`${serverConfig.botApi}/${guildID}/roles`, {
            method: "GET",
            headers: {
                Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
            }
        }).then((res) => res.json())
    ]);

    return typedjson({ messages, channels, roles }, cachePrefetch(request));
}

export async function action({ request, params }: ActionFunctionArgs) {
    csrf(request);
    const user = await getUser(request, {
        prime: true
    });
    if (!user?.prime) {
        return typedjson({
            success: false,
            message: "Prime is required to use this feature."
        });
    }
    const guildID = params.guildID!;
    await requireUserGuild(request, guildID);

    const formData = await request.formData();
    const type = formData.get("type") as "livecheck" | "alert";
    const status = formData.get("status")?.toString().toUpperCase() as "ONLINE" | "OFFLINE";
    const message = formData.get("message") as string;

    const { success, message: resMessage } = await fetch(
        `${serverConfig.botApi}/${guildID}/custom-messages`,
        {
            method: "PATCH",
            headers: {
                Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
            },
            body: new URLSearchParams({
                type,
                message,
                status
            })
        }
    ).then((res) => res.json());

    return typedjson({
        success,
        message: resMessage
    });
}

export default function Editor() {
    const { messages, channels, roles } = useAnimationLoaderData<typeof loader>();
    const user = useUser(true);
    const [brand] = useToken("colors", ["brand"]);

    return (
        <>
            {!user.prime && (
                <Flex
                    color={"textSec"}
                    p={4}
                    bg={"bgSec"}
                    borderRadius={10}
                    border={"2px solid"}
                    fontWeight={"medium"}
                    borderColor={"brand"}
                    boxShadow={`0px 0px 10px ${brand}`}
                    w="100%"
                    align={"center"}
                    justify={"center"}
                    textAlign={"center"}
                >
                    <Text>
                        Running website, API and constantly running bot is not cheap. That's why we
                        have to lock some features behind Prime subscription. If you want to support
                        us, to keep running our services and get access to all features, consider
                        subscribing to{" "}
                        <Link to={"/prime"} color={"brand"} textDecor={"underline"}>
                            Prime
                        </Link>{" "}
                        💖
                    </Text>
                </Flex>
            )}

            <VStack w="100%" align={"start"} spacing={7}>
                <LivecheckEditor channels={channels} messages={messages} roles={roles} />
                <AlertEditor channels={channels} messages={messages} roles={roles} />
            </VStack>

            <Divider my={10} />

            <Text color={"textSec"}>
                To edit the messages, select which status message you want to edit, and then start
                editing! Changes are saved automatically. Pro tip: If you wanna use an image, you
                can upload it to Discord and then copy the link to the image and paste it in the
                message box or use service like imgur to host the image.
            </Text>
        </>
    );
}
