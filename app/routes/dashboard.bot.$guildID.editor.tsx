import { requireEnv } from "@/.server/functions/env.server";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import AlertEditor from "@/layout/routes/dashboard/bot/editor/AlertEditor";
import LivecheckEditor from "@/layout/routes/dashboard/bot/editor/LivecheckEditor";
import { Divider, Text, VStack } from "@chakra-ui/react";
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
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const formData = await request.formData();
	const type = formData.get("type") as "livecheck" | "alert";
	const status = formData.get("status")?.toString().toUpperCase() as "ONLINE" | "OFFLINE";
	const message = formData.get("message") as string;

	const { success, message: resMessage } = await fetch(`${serverConfig.botApi}/${guildID}/custom-messages`, {
		method: "PATCH",
		headers: {
			Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
		},
		body: new URLSearchParams({
			type,
			message,
			status
		})
	}).then((res) => res.json());

	return typedjson({
		success,
		message: resMessage
	});
}

export default function Editor() {
	const { messages, channels, roles } = useAnimationLoaderData<typeof loader>();

	return (
		<>
			<VStack w="100%" align={"start"} spacing={7}>
				<LivecheckEditor channels={channels} messages={messages} roles={roles} />
				<AlertEditor channels={channels} messages={messages} roles={roles} />
			</VStack>

			<Divider my={10} />

			<Text color={"textSec"}>
				To edit status colors for the bot's embed responses, click on the "Color Fill" icon located on the bottom right
				corner of the color box. This will open up the color picker. To save your changes, click on the "Update" button.
			</Text>
		</>
	);
}
