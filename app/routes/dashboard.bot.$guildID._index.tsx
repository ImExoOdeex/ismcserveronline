import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Code,
	Divider,
	FormLabel,
	HStack,
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
import { useRevalidator } from "@remix-run/react";
import { Select } from "chakra-react-select";
import { useEffect, useState } from "react";
import { BiSave } from "react-icons/bi";
import { HiRefresh } from "react-icons/hi";
import { TbTrash } from "react-icons/tb";
import { redirect, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import LivecheckNumbers from "~/components/layout/dashboard/LivecheckNumbers";
import { Info, sendActionWebhook } from "~/components/server/auth/webhooks";
import { getUser } from "~/components/server/db/models/user";
import { requireEnv } from "~/components/server/functions/env.server";
import { requireUserGuild } from "~/components/server/functions/secureDashboard.server";
import serverConfig from "~/components/server/serverConfig.server";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";
import useFetcherCallback from "~/components/utils/hooks/useFetcherCallback";

export async function loader({ params, request }: LoaderFunctionArgs) {
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
			method: "get",
			headers: {
				Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
			}
		}).then((res) => res.json()),
		fetch(`${serverConfig.botApi}/${guildID}/channels`, {
			method: "get",
			headers: {
				Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
			}
		}).then((res) => res.json())
	]);

	return typedjson({ livecheck, channels });
}

export async function action({ request, params }: ActionFunctionArgs) {
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
			method: "post",
			headers: {
				"Content-Type": "application/json",
				Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
			},
			body: JSON.stringify(Object.fromEntries(formData))
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

	const livecheckFetcher = useFetcherCallback((data) => {
		setIsEditing(false);
		setTimeout(() => {
			revalidate();
		}, 7000);
	});
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const { revalidate, state } = useRevalidator();

	useEffect(() => {
		const interval = setInterval(revalidate, 15000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [clickedAction, setClickedAction] = useState<"toggle" | "edit" | null>();

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
											/>
										) : (
											<Text fontWeight={600} fontSize={"xl"}>
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
											chakraStyles={{
												control: (provided) => ({
													...provided,
													borderRadius: "none",
													w: "100%",
													cursor: "pointer",
													alignItems: "center",
													h: "30px",
													borderColor: "alpha100",
													display: "flex"
												}),
												dropdownIndicator: (provided, { selectProps: { menuIsOpen } }) => ({
													...provided,
													"> svg": {
														transitionDuration: "normal",
														transform: `rotate(${menuIsOpen ? -180 : 0}deg)`
													},
													background: "transparent",
													padding: "0 5px"
												}),
												container: (provided) => ({
													...provided,
													h: "30px",
													w: "100%",
													bg: "transparent"
												}),
												input: (provided) => ({
													...provided,
													h: "30px",
													bg: "transparent"
												}),
												menuList: (provided) => ({
													...provided,
													mt: 2,
													rounded: "lg",
													bg: "bg"
												}),
												option: (provided) => ({
													...provided,
													bg: "bg",
													color: "text",
													_hover: {
														bg: "alpha100"
													}
												})
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
										/>
									) : (
										<Text fontWeight={600} fontSize={"xl"}>
											{livecheck.bedrock ? "Bedrock" : "Java"}
										</Text>
									)}
								</VStack>
							</Stack>

							<VStack w="100%" align={"start"} spacing={0}>
								<FormLabel>Channel Id</FormLabel>
								{isEditing ? (
									<Select
										name="channel"
										variant={"flushed"}
										defaultValue={{
											label: `#${
												channels.find((c: { name: string; id: string }) => c.id === livecheck.channel_id)
													?.name
											}`,
											value: livecheck.channel_id
										}}
										chakraStyles={{
											control: (provided) => ({
												...provided,
												borderRadius: "none",
												cursor: "pointer",
												alignItems: "center",
												h: "30px",
												w: "512px",
												borderColor: "alpha100",
												display: "flex"
											}),
											dropdownIndicator: (provided, { selectProps: { menuIsOpen } }) => ({
												...provided,
												"> svg": {
													transitionDuration: "normal",
													transform: `rotate(${menuIsOpen ? -180 : 0}deg)`
												},
												background: "transparent",
												padding: "0 5px"
											}),
											container: (provided) => ({
												...provided,
												h: "30px",
												w: "100%",
												bg: "transparent"
											}),
											input: (provided) => ({
												...provided,
												h: "30px",
												bg: "transparent"
											}),
											menuList: (provided) => ({
												...provided,
												mt: 2,
												rounded: "lg",
												bg: "bg"
											}),
											option: (provided) => ({
												...provided,
												bg: "bg",
												color: "text",
												_hover: {
													bg: "alpha100"
												}
											})
										}}
										options={channels.map((channel: { name: string; id: string }) => ({
											label: `#${channel.name}`,
											value: channel.id
										}))}
									/>
								) : (
									<Text fontWeight={600} fontSize={"xl"}>
										{`#${
											channels.find((c: { name: string; id: string }) => c.id === livecheck.channel_id)
												?.name
										}`}
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
										rounded={"xl"}
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
										chakraStyles={{
											control: (provided) => ({
												...provided,
												borderRadius: "xl",
												w: "100%",
												cursor: "pointer",
												bg: "alpha",
												_hover: {
													bg: "alpha200"
												}
											}),
											dropdownIndicator: (provided, { selectProps: { menuIsOpen } }) => ({
												...provided,
												"> svg": {
													transitionDuration: "normal",
													transform: `rotate(${menuIsOpen ? -180 : 0}deg)`
												},
												background: "transparent",
												padding: "0 5px"
											}),
											container: (provided) => ({
												...provided,
												borderRadius: "xl",
												w: "100%",
												bg: "transparent"
											}),
											input: (provided) => ({
												...provided,
												rounded: "xl",
												bg: "transparent"
											}),
											menuList: (provided) => ({
												...provided,
												bg: "bg"
											}),
											option: (provided) => ({
												...provided,
												bg: "bg",
												color: "text",
												_hover: {
													bg: "alpha100"
												}
											})
										}}
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
									chakraStyles={{
										control: (provided) => ({
											...provided,
											borderRadius: "xl",
											cursor: "pointer",
											w: "100%",
											bg: "alpha",
											_hover: {
												bg: "alpha200"
											}
										}),
										dropdownIndicator: (provided, { selectProps: { menuIsOpen } }) => ({
											...provided,
											"> svg": {
												transitionDuration: "normal",
												transform: `rotate(${menuIsOpen ? -180 : 0}deg)`
											},
											background: "transparent",
											padding: "0 5px"
										}),
										container: (provided) => ({
											...provided,
											borderRadius: "xl",
											w: "100%",
											bg: "transparent"
										}),
										input: (provided) => ({
											...provided,
											rounded: "xl",
											w: "100%",
											bg: "transparent"
										}),
										menuList: (provided) => ({
											...provided,
											bg: "bg"
										}),
										option: (provided) => ({
											...provided,
											bg: "bg",
											color: "text",
											_hover: {
												bg: "alpha100"
											}
										})
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
										? clickedAction === "edit"
											? livecheckFetcher.state !== "idle"
											: false
										: state === "loading"
								}
								onClick={
									isEditing
										? () => {
												setClickedAction("edit");
										  }
										: revalidate
								}
								variant={"brand"}
							>
								<HStack>
									<Icon as={isEditing ? BiSave : HiRefresh} />
									<Text>{isEditing ? "Save data" : "Refresh data"}</Text>
								</HStack>
							</Button>
						</WrapItem>
						{/* )} */}
						<WrapItem>
							<Button
								transform={"auto-gpu"}
								isLoading={clickedAction === "toggle" ? livecheckFetcher.state !== "idle" : false}
								type="submit"
								name="_action"
								value={"toggle"}
								onClick={() => {
									setClickedAction("toggle");
								}}
								colorScheme={livecheck ? "red" : "green"}
								_hover={{ bg: livecheck ? "red.700" : "green.600" }}
								_active={{ bg: livecheck ? "red.800" : "green.700", scale: 0.9 }}
								bg={livecheck ? "red.500" : "green.500"}
								color={livecheck ? "white" : "white"}
							>
								<HStack>
									{livecheck ? <Icon as={TbTrash} /> : <AddIcon />}
									<Text>{livecheck ? "Disable" : "Enable"} livecheck</Text>
								</HStack>
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
								>
									<HStack>
										<EditIcon />
										<Text>{isEditing ? "Cancel editing" : "Edit livecheck"}</Text>
									</HStack>
								</Button>
							</WrapItem>
						)}
					</Wrap>
					{data && (
						<Text fontWeight={600} color={data.success ? "green" : "red"}>
							{data.message}
						</Text>
					)}
					{livecheck && <Text fontSize={"xs"}>Data refreshes automatically every 30 seconds.</Text>}
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
