import { requireEnv } from "@/.server/functions/env.server";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Select from "@/layout/global/Select";
import { Divider, Text } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { typedjson } from "remix-typedjson";

export async function loader({ params, request }: LoaderFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const [channels] = await Promise.all([
		fetch(`${serverConfig.botApi}/${guildID}/channels`, {
			method: "GET",
			headers: {
				Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
			}
		}).then(
			(res) =>
				res.json() as Promise<
					{
						name: string;
						id: string;
					}[]
				>
		)
	]);

	return typedjson({ channels }, cachePrefetch(request));
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
	const { channels } = useAnimationLoaderData<typeof loader>();

	const [channel, setChannel] = useState<string>("");

	return (
		<>
			<Text fontWeight={500}>Select a channel you'd like to sync messages to</Text>

			<Select
				container={{
					w: "300px"
				}}
				value={{
					label: channels.find((c) => c.id === channel)?.name || "Select a channel",
					value: channel
				}}
				onChange={(e) => setChannel(e?.value || "")}
				options={channels.map((c) => ({ label: c.name, value: c.id }))}
			/>

			<Divider my={10} />

			<Text color={"textSec"}>Chat sync allows to sync messages from Minecraft server to discord channel</Text>
		</>
	);
}
