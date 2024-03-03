import { requireEnv } from "@/.server/functions/env.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useFetcherCallback from "@/hooks/useFetcherCallback";
import DiscordMessageEditor from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
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
	return typedjson({ messages, channels, roles });
}

export async function action({ request, params }: ActionFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const formData = await request.formData();

	return typedjson({});
}

export default function Config() {
	const { messages, channels, roles } = useAnimationLoaderData<typeof loader>();

	const fetcher = useFetcherCallback((data) => {
		return null;
	});

	return (
		<fetcher.Form method="POST" style={{ width: "100%" }}>
			<VStack w="100%" align={"start"} spacing={7}>
				<DiscordMessageEditor
					message={messages[0]}
					type="livecheck"
					data={{
						guildData: {
							channels,
							roles
						}
					}}
				/>
			</VStack>

			<Divider my={10} />

			<Text color={"textSec"}>
				To edit status colors for the bot's embed responses, click on the "Color Fill" icon located on the bottom right
				corner of the color box. This will open up the color picker. To save your changes, click on the "Update" button.
			</Text>
		</fetcher.Form>
	);
}
