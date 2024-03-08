import { Info, sendActionWebhook } from "@/.server/auth/webhooks";
import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import { decimalToHex } from "@/functions/colors";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import StatusColor from "@/layout/routes/dashboard/bot/StatusColor";
import { Divider, Stack, Text, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typeddefer, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function loader({ params, request }: LoaderFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const config = await fetch(`${serverConfig.botApi}/${guildID}/config`, {
		method: "GET",
		headers: {
			Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
		}
	}).then((res) => res.json());

	const colorPromises = Promise.all(
		[config.online_color, config.offline_color].map((color: number) => {
			return fetch(`https://www.thecolorapi.com/id?hex=${decimalToHex(color).replace("#", "")}`, {
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then((res) => res.json())
				.then((res) => {
					return res.name.value as string;
				});
		})
	);

	return typeddefer({ config, colorPromises }, cachePrefetch(request));
}

export async function action({ request, params }: ActionFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const formData = await request.formData();

	const updatedValue = formData.get("onlineColor")?.toString() || formData.get("offlineColor")?.toString();
	invariant(updatedValue, "No color provided");
	const updatedColor = formData.get("onlineColor")?.toString() ? "onlineColor" : "offlineColor";

	const res = await fetch(`${serverConfig.botApi}/${guildID}/config/edit`, {
		method: "POST",
		headers: {
			Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
		},
		body: new URLSearchParams({
			[updatedColor]: updatedValue
		})
	}).then((res) => res.json());

	getUser(request).then((user) => {
		if (user) {
			function hexToDecimal(hex: string) {
				return parseInt(hex.replace("#", ""), 16);
			}

			sendActionWebhook(
				user,
				`modify config. online: ${formData.get("onlineColor")}, offline: ${formData.get("offlineColor")}`,
				new Info(request.headers),
				hexToDecimal(formData.get("onlineColor")?.toString() ?? "#00ff00")
			);
		}
	});

	return typedjson(res);
}

export default function Config() {
	const { config, colorPromises } = useAnimationLoaderData<typeof loader>();
	return (
		<>
			<VStack w="100%" align={"start"} spacing={7}>
				<Stack direction={{ base: "column", md: "row" }} spacing={5} w={{ base: "100%", md: "xl" }}>
					<StatusColor config={config} type="online" colorPromises={colorPromises} />
					<StatusColor config={config} type="offline" colorPromises={colorPromises} />
				</Stack>
			</VStack>

			<Divider my={10} />

			<Text color={"textSec"}>
				To edit status colors for the bot's embed responses, click on the "Color Fill" icon located on the bottom right
				corner of the color box. This will open up the color picker. To save your changes, click on the "Update" button.
			</Text>
		</>
	);
}
