import { Button, Divider, HStack, Icon, Stack, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { BiSave } from "react-icons/bi";
import { HiRefresh } from "react-icons/hi";
import { typedjson } from "remix-typedjson";
import StatusColor from "~/components/layout/dashboard/StatusColor";
import { Info, sendActionWebhook } from "~/components/server/auth/webhooks";
import { getUser } from "~/components/server/db/models/user";
import { requireEnv } from "~/components/server/functions/env.server";
import { requireUserGuild } from "~/components/server/functions/secureDashboard.server";
import serverConfig from "~/components/server/serverConfig.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const config = await fetch(`${serverConfig.botApi}/${guildID}/config`, {
		method: "GET",
		headers: {
			Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
		}
	}).then((res) => res.json());

	return typedjson({ config });
}

export async function action({ request, params }: ActionFunctionArgs) {
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const formData = await request.formData();

	const res = await fetch(`${serverConfig.botApi}/${guildID}/config/edit`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
		},
		body: JSON.stringify(Object.fromEntries(formData))
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
	const lastConfig = useRef(null);
	const { config } = useLoaderData<typeof loader>() || {
		config: lastConfig.current
	};
	useEffect(() => {
		if (config) lastConfig.current = config;
	}, [config]);

	const fetcher = useFetcher();
	const { revalidate, state } = useRevalidator();

	const data = fetcher.data as any;

	return (
		<fetcher.Form method="POST" style={{ width: "100%" }}>
			<VStack w="100%" align={"start"} spacing={7}>
				<Stack direction={{ base: "column", md: "row" }} spacing={5} w={{ base: "100%", md: "xl" }}>
					<StatusColor config={config} type="online" />
					<StatusColor config={config} type="offline" />
				</Stack>
				<VStack w="100%" align={"start"}>
					<Wrap>
						<WrapItem>
							<Button
								transform={"auto-gpu"}
								_active={{ scale: 0.9 }}
								isLoading={state === "loading"}
								onClick={revalidate}
								variant={"brand"}
							>
								<HStack>
									<Icon as={HiRefresh} />
									<Text>{"Refresh data"}</Text>
								</HStack>
							</Button>
						</WrapItem>

						<WrapItem>
							<Button
								transform={"auto-gpu"}
								isLoading={fetcher.state !== "idle"}
								type="submit"
								variant={"brand"}
								colorScheme={"green"}
								_hover={{ bg: "green.600" }}
								_active={{ bg: "green.700", scale: 0.9 }}
								bg={"green.500"}
								color={"white"}
							>
								<HStack>
									<Icon as={BiSave} />
									<Text>Update</Text>
								</HStack>
							</Button>
						</WrapItem>
					</Wrap>
					{data && (
						<Text color={data.success ? "green" : "red"} fontWeight={600}>
							{data.message}
						</Text>
					)}
				</VStack>
			</VStack>

			<Divider my={10} />

			<Text color={"textSec"}>
				To edit status colors for the bot's embed responses, click on the "Color Fill" icon located on the bottom right
				corner of the color box. This will open up the color picker. To save your changes, click on the "Update" button.
			</Text>
		</fetcher.Form>
	);
}
