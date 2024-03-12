import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { encrypt } from "@/.server/modules/encryption";
import { sendVoteWebhook } from "@/.server/modules/voting";
import useFetcherCallback from "@/hooks/useFetcherCallback";
import useServerPanelData from "@/hooks/useServerPanelData";
import { Button, Code, Divider, Flex, Input, Text, useToast } from "@chakra-ui/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import type { MetaArgs, MetaFunction } from "@remix-run/react";
import { useState } from "react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ data, matches, params }: MetaArgs) {
	return [
		{
			title: params.server + "'s votes webhook | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function action({ request, params }: ActionFunctionArgs) {
	csrf(request);

	const user = await getUser(request);
	invariant(user, "User not found");

	const form = await request.formData();

	const intent = form.get("intent") as "update" | "test";

	switch (intent) {
		case "update": {
			try {
				const webhookUrl = form.get("webhookUrl") as string;
				const webhookPassword = form.get("webhookPassword") as string;

				invariant(webhookUrl, "Webhook URL is required");
				invariant(webhookPassword, "Webhook Password is required");

				// min length 5, max length 256
				invariant(webhookUrl.length >= 5, "Webhook URL is too short");
				invariant(webhookUrl.length <= 256, "Webhook URL is too long");
				// make sure it's valid URL
				invariant(webhookUrl.match(/^(https?):\/\/[^\s$.?#].[^\s]*$/), "Invalid URL");
				// min length 2, max length 32
				invariant(webhookPassword.length >= 2, "Webhook Password is too short");
				invariant(webhookPassword.length <= 32, "Webhook Password is too long");

				const path = new URL(request.url).pathname;
				const serverAddress = params.server;
				const isBedrock = path.split("/")[0] === "bedrock";

				const server = await db.server.findFirst({
					where: {
						server: serverAddress,
						bedrock: isBedrock,
						owner_id: user.id
					}
				});
				invariant(server, "Server not found");

				await db.server.update({
					where: {
						id: server.id
					},
					data: {
						vote_webhook_url: webhookUrl,
						vote_webhook_password: await encrypt(webhookPassword)
					}
				});

				return typedjson({
					success: true
				});
			} catch (e) {
				console.error(e);
				return typedjson({
					success: false,
					message: (e as Error).message
				});
			}
		}
		case "test": {
			const path = new URL(request.url).pathname;
			const serverAddress = params.server;
			const isBedrock = path.split("/")[0] === "bedrock";

			const server = await db.server.findFirst({
				where: {
					server: serverAddress,
					bedrock: isBedrock,
					owner_id: user.id
				}
			});
			invariant(server, "Server not found");

			await sendVoteWebhook(server, {
				server: server.server,
				nick: user.nick,
				bedrock: server.bedrock
			});

			return typedjson({
				success: true
			});
		}
		default:
			throw new Error("Invalid intent");
	}
}

export default function ServerPanel() {
	const data = useServerPanelData();

	const toast = useToast();
	const fetcher = useFetcherCallback((data) => {
		if (fetcher.formData?.get("intent") === "update") {
			toast({
				title: data.success ? "Webhook has been updated" : "Failed to update webhook",
				description: data.success ? null : data.message,
				status: data.success ? "success" : "error"
			});
		} else {
			toast({
				title: data.success ? "Test has been sent" : "Failed to send test",
				status: data.success ? "info" : "error"
			});
		}
	});

	const [webhookUrl, setWebhookUrl] = useState(data.vote_webhook_url || "");

	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
			<Flex w="100%" gap={5} flexDir={"column"} as={fetcher.Form} method="PATCH">
				<Flex
					w="100%"
					gap={2}
					flexDir={{
						base: "column",
						md: "row"
					}}
					alignItems={{
						base: "flex-start",
						md: "center"
					}}
					justifyContent={"space-between"}
				>
					<Flex flexDir={"column"} gap={1}>
						<Text fontSize="lg" fontWeight="600">
							Webhook Url
						</Text>
						<Text color="textSec">
							Webhook URL that our server will POST to it, when someone votes for your server.
						</Text>
					</Flex>

					<Input
						name="webhookUrl"
						value={webhookUrl}
						onChange={(e) => setWebhookUrl(e.target.value)}
						isInvalid={!!webhookUrl && !webhookUrl?.match(/^(https?):\/\/[^\s$.?#].[^\s]*$/)}
						minLength={5}
						maxLength={256}
						variant={"filled"}
						maxW={{
							base: "100%",
							md: "320px"
						}}
						placeholder="https://example.com/api/vote"
					/>
				</Flex>
				<Flex
					w="100%"
					gap={2}
					flexDir={{
						base: "column",
						md: "row"
					}}
					alignItems={{
						base: "flex-start",
						md: "center"
					}}
					justifyContent={"space-between"}
				>
					<Flex flexDir={"column"} gap={1}>
						<Text fontSize="lg" fontWeight="600">
							Webhook Password
						</Text>
						<Text color="textSec">
							Set the password for authorizing webhook. Check the "Authorization" header in the request and make
							sure it's same one you set here.
						</Text>
					</Flex>

					<Input
						name="webhookPassword"
						defaultValue={data.vote_webhook_password ?? ""}
						minLength={2}
						maxLength={32}
						variant={"filled"}
						maxW={{
							base: "100%",
							md: "320px"
						}}
						type="password"
						placeholder="secret"
					/>
				</Flex>

				<Flex gap={2} alignItems={"center"} w="100%" justifyContent={"flex-end"}>
					<Button
						px={6}
						type="submit"
						isLoading={fetcher.state !== "idle" && fetcher.formData?.get("intent") === "test"}
						name="intent"
						value="test"
					>
						Send test
					</Button>

					<Button
						px={6}
						type="submit"
						variant={"brand"}
						isLoading={fetcher.state !== "idle" && fetcher.formData?.get("intent") === "update"}
						name="intent"
						value="update"
					>
						Save
					</Button>
				</Flex>
			</Flex>

			<Divider />

			<Flex w="100%" gap={5} flexDir={"column"}>
				<Flex flexDir={"column"} gap={1}>
					<Text fontSize="lg" fontWeight="600">
						Webhook Guide
					</Text>
					<Text color="textSec">
						You can use webhooks to get notified when someone votes for your server. We will send a POST request to
						the URL you set, when someone votes for your server. You can use this feature to reward your players for
						voting.
					</Text>
				</Flex>

				<Flex flexDir={"column"} gap={1}>
					<Text fontSize="lg" fontWeight="600">
						Securing Webhook
					</Text>
					<Text color="textSec">
						At your end, you need to check if the "Authorization" header matches the password you set here. This
						prevents unauthorized requests to your webhook URL. Example in JavaScript:
					</Text>
					<Code>
						{`if (request.headers.authorization === "${data.vote_webhook_password?.replace(/./g, "*")}") {
	// Request is authorized
}`}
					</Code>
				</Flex>
			</Flex>
		</Flex>
	);
}
