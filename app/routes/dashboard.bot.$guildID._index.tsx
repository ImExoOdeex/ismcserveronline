import { Info, sendActionWebhook } from "@/.server/auth/webhooks";
import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import Select from "@/layout/global/Select";
import Alerts from "@/layout/routes/dashboard/bot/Alerts";
import LivecheckNumbers from "@/layout/routes/dashboard/bot/LivecheckNumbers";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Code,
	Divider,
	FormLabel,
	Heading,
	Icon,
	Input,
	Skeleton,
	Stack,
	Text,
	VStack,
	Wrap,
	WrapItem
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useRevalidator, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BiSave } from "react-icons/bi";
import { HiRefresh } from "react-icons/hi";
import { TbTrash } from "react-icons/tb";
import { redirect, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function loader({ params, request }: LoaderFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const user = await getUser(request);
	invariant(user, "User is not logged in.");

	const url = new URL(request.url);
	const number = url.searchParams.get("number") ?? "1";

	if (!user?.prime && Number(number) >= 3) {
		throw redirect(`/dashboard/bot/${params.guildID}`);
	}

	const [livecheck, channels] = await Promise.all([
		fetch(`${serverConfig.botApi}/${guildID}/livecheck/${number}`, {
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
		}).then(
			(res) =>
				res.json() as Promise<
					{
						id: string;
						name: string;
					}[]
				>
		)
	]);

	return typedjson({ livecheck, channels }, cachePrefetch(request));
}

export async function action({ request, params }: ActionFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	await requireUserGuild(request, guildID);

	const formData = await request.formData();
	const url = new URL(request.url);
	const number = url.searchParams.get("number") ?? "1";

	const edition = formData.get("edition");
	if (edition) {
		if (
			formData.get("address")!.toString()!.length < 3 ||
			formData.get("address")!.toString()!.length > 100 ||
			!formData.get("address")!.toString().includes(".")
		) {
			return json(
				{ message: "Address must be between 3 and 100 characters and must be valid domain/IP address.", success: false },
				{ status: 400 }
			);
		}
	}

	const res = await (
		await fetch(`${serverConfig.botApi}/${guildID}/livecheck/edit/${number}`, {
			method: "POST",
			headers: {
				Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
			},
			body: formData
		})
	).json();

	getUser(request).then((user) => {
		if (user) {
			sendActionWebhook(
				user,
				`toggle livecheck for ${formData.get("address")} on ${formData.get("edition")}`,
				new Info(request.headers)
			);
		}
	});

	return json(res);
}

export default function Index() {
	const { livecheck, channels } = useAnimationLoaderData<typeof loader>();

	const progressBar = useProgressBarContext();
	const livecheckFetcher = useDebouncedFetcherCallback((data) => {
		setIsEditing(false);
		setTimeout(() => {
			revalidate();
		}, 7000);

		progressBar.startAndDone();
	});
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const { revalidate, state } = useRevalidator();

	useEffect(() => {
		const interval = setInterval(revalidate, 30_000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [searchParams] = useSearchParams();
	const number = Number(searchParams.get("number") ?? 1);

	return (
		<VStack w="100%" align={"start"} spacing={10}>
			<LivecheckNumbers />

			<Divider />

			<livecheckFetcher.Form method="POST" style={{ width: "100%" }}>
				<VStack w="100%" align={"start"} spacing={5}>
					<VStack align={"start"} spacing={1}>
						<Heading as={"h3"} fontSize={"2xl"}>
							Livecheck is{" "}
							<Box as="span" color={livecheck ? "green" : "red"}>
								{livecheck ? "enabled" : "disabled"}
							</Box>
						</Heading>
						{livecheck && (
							<Code fontSize={"xs"}>Next check at {new Date(livecheck.next_check_date).toLocaleTimeString()}</Code>
						)}
					</VStack>

					{livecheck ? (
						<>
							<Stack
								direction={{ base: "column", md: "row" }}
								spacing={{ base: 5, md: 10 }}
								justifyContent={"start"}
								alignItems={"start"}
								w={{ base: "100%", md: "lg" }}
							>
								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Address</FormLabel>
									<Box pos="relative" h="100%" w="100%">
										{isEditing ? (
											<Input
												pos={"absolute"}
												borderColor={"alpha200"}
												top={0}
												left={0}
												w={"100%"}
												minLength={3}
												maxLength={100}
												variant={"flushed"}
												name="address"
												defaultValue={livecheck.address}
												fontWeight={600}
											/>
										) : (
											<Text fontWeight={600} fontSize={"xl"} minH={"40px"}>
												{livecheck.address}
											</Text>
										)}
									</Box>
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Edition</FormLabel>
									{isEditing ? (
										<Select
											name="edition"
											variant={"flushed"}
											defaultValue={{
												label: livecheck.bedrock ? "Bedrock" : "Java",
												value: livecheck.bedrock ? "bedrock" : "java"
											}}
											options={
												[
													{
														label: "Java",
														value: "java"
													},
													{
														label: "Bedrock",
														value: "bedrock"
													}
												] as any[]
											}
											container={{
												w: "100%"
											}}
										/>
									) : (
										<Text fontWeight={600} fontSize={"xl"} minH={"40px"}>
											{livecheck.bedrock ? "Bedrock" : "Java"}
										</Text>
									)}
								</VStack>
							</Stack>

							<VStack align={"start"} spacing={0} w={{ base: "100%", md: "lg" }}>
								<FormLabel>Channel Id</FormLabel>
								{isEditing ? (
									<Select
										name="channel"
										variant={"flushed"}
										defaultValue={{
											label: `#${channels.find((c) => c.id === livecheck.channel_id)?.name}`,
											value: livecheck.channel_id
										}}
										options={channels.map((channel) => ({
											label: `#${channel.name}`,
											value: channel.id
										}))}
										container={{
											w: "100%"
										}}
									/>
								) : (
									<Text fontWeight={600} fontSize={"xl"} minH={"40px"}>
										{`#${channels.find((c) => c.id === livecheck.channel_id)?.name}`}
									</Text>
								)}
							</VStack>

							<Stack
								direction={{ base: "column", md: "row" }}
								spacing={{ base: 5, md: 10 }}
								justifyContent={"start"}
								alignItems={"start"}
								w={{ base: "100%", md: "lg" }}
							>
								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Last status</FormLabel>
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.last_status ?? (
											<Skeleton
												h="20px"
												w="100px"
												rounded={"xl"}
												startColor="transparent"
												endColor="alpha200"
											/>
										)}
									</Text>
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Last players</FormLabel>
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.last_players ?? (
											<Skeleton
												h="20px"
												w="100px"
												rounded={"xl"}
												startColor="transparent"
												endColor="alpha200"
											/>
										)}
									</Text>
								</VStack>
							</Stack>
						</>
					) : (
						<>
							<Stack
								direction={{ base: "column", md: "row" }}
								spacing={{ base: 5, md: 10 }}
								justifyContent={"start"}
								alignItems={"start"}
								w={{ base: "100%", md: "lg" }}
							>
								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Address</FormLabel>
									<Input
										bg="alpha"
										name="address"
										variant={"filled"}
										min={3}
										max={100}
										_hover={{
											bg: "alpha100"
										}}
									/>
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Edition</FormLabel>
									<Select
										name="edition"
										variant={"filled"}
										options={[
											{
												label: "Java",
												value: "java"
											},
											{
												label: "Bedrock",
												value: "bedrock"
											}
										]}
										container={{
											w: "100%"
										}}
									/>
								</VStack>
							</Stack>

							<VStack align={"start"} spacing={0} w={{ base: "100%", md: "lg" }}>
								<FormLabel>Channel</FormLabel>
								<Select
									name="channel"
									variant={"filled"}
									options={channels.map((channel: { name: string; id: string }) => ({
										label: `#${channel.name}`,
										value: channel.id
									}))}
									container={{
										w: "100%"
									}}
								/>
							</VStack>
						</>
					)}

					<Wrap>
						{/* {livecheck && ( */}
						<WrapItem>
							<Button
								transform={"auto-gpu"}
								_active={{ scale: 0.9 }}
								type={isEditing ? "submit" : "button"}
								name="_action"
								value={"edit"}
								isLoading={
									isEditing
										? livecheckFetcher.formData?.get("_action") === "edit"
											? livecheckFetcher.state !== "idle"
											: false
										: state === "loading"
								}
								onClick={isEditing ? undefined : revalidate}
								variant={"brand"}
								leftIcon={<Icon as={isEditing ? BiSave : HiRefresh} />}
							>
								{isEditing ? "Save data" : "Refresh data"}
							</Button>
						</WrapItem>
						{/* )} */}
						<WrapItem>
							<Button
								transform={"auto-gpu"}
								isLoading={
									livecheckFetcher.formData?.get("_action") === "toggle"
										? livecheckFetcher.state !== "idle"
										: false
								}
								type="submit"
								name="_action"
								value={"toggle"}
								colorScheme={livecheck ? "red" : "green"}
								_hover={{ bg: livecheck ? "red.700" : "green.600" }}
								_active={{ bg: livecheck ? "red.800" : "green.700", scale: 0.9 }}
								bg={livecheck ? "red.500" : "green.500"}
								color={livecheck ? "white" : "white"}
								leftIcon={<Icon as={livecheck ? TbTrash : AddIcon} />}
							>
								{livecheck ? "Disable" : "Enable"} livecheck
							</Button>
						</WrapItem>
						{livecheck && (
							<WrapItem>
								<Button
									onClick={() => setIsEditing(!isEditing)}
									transform={"auto-gpu"}
									_active={{ scale: 0.9 }}
									_hover={{ bg: "alpha200" }}
									bg="alpha100"
									leftIcon={<EditIcon />}
								>
									{isEditing ? "Cancel editing" : "Edit livecheck"}
								</Button>
							</WrapItem>
						)}
					</Wrap>
					{livecheck && <Text fontSize={"xs"}>Data refreshes automatically every 30 seconds.</Text>}

					<Divider my={5} />

					<Alerts key={number} livecheckFetcher={livecheckFetcher} />
				</VStack>

				<Divider my={10} />

				<Text color={"textSec"}>
					Livecheck checks Minecraft's server status every 30 seconds and updates the message in real-time if there are
					any changes to the player count or server status. To set it up, enter the server address, select the correct
					Minecraft edition, and choose the appropriate channel to display the server status.
				</Text>
			</livecheckFetcher.Form>
		</VStack>
	);
}
