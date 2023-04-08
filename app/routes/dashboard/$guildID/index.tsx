import { type LoaderArgs, json, type ActionArgs } from "@remix-run/node";
import {
	Button,
	FormLabel,
	HStack,
	Heading,
	Icon,
	Stack,
	Text,
	VStack,
	Code,
	Input,
	Select,
	Box,
	Wrap,
	WrapItem,
	Skeleton
} from "@chakra-ui/react";
import { fetch } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { useRef, useEffect, useState } from "react";
import { TbTrash } from "react-icons/tb";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { HiRefresh } from "react-icons/hi";
import { BiSave } from "react-icons/bi";

export async function loader({ params }: LoaderArgs) {
	const guildID = params.guildID!;

	const [livecheck, channels] = await Promise.all([
		fetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/${guildID}/livecheck`,
			{
				method: "get",
				headers: {
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				}
			}
		).then((res) => res.json()),
		fetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/${guildID}/channels`,
			{
				method: "get",
				headers: {
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				}
			}
		).then((res) => res.json())
	]);

	return json({ livecheck, channels });
}

export async function action({ request, params }: ActionArgs) {
	const formData = await request.formData();
	const guildID = params.guildID!;

	const res = await (
		await fetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/${guildID}/livecheck/edit`,
			{
				method: "post",
				headers: {
					"Content-Type": "application/json",
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				},
				body: JSON.stringify(Object.fromEntries(formData))
			}
		)
	).json();

	return json(res);
}

export default function Index() {
	const lastLivecheck = useRef(null);
	const lastChannels = useRef([]);
	const { livecheck, channels } = useLoaderData<typeof loader>() || {
		livecheck: lastLivecheck.current,
		channels: lastChannels.current
	};
	useEffect(() => {
		if (livecheck) lastLivecheck.current = livecheck;
		if (channels) lastChannels.current = channels;
	}, [livecheck, channels]);

	const livecheckFetcher = useFetcher();
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const { revalidate, state } = useRevalidator();

	useEffect(() => {
		const interval = setInterval(revalidate, 15000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const data = livecheckFetcher.data;
	useEffect(() => {
		if (data) {
			setIsEditing(false);
			setTimeout(() => {
				revalidate();
			}, 500);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	const [clickedAction, setClickedAction] = useState<"toggle" | "edit" | null>();

	return (
		<VStack w="100%" align={"start"} spacing={10}>
			<livecheckFetcher.Form method="post" style={{ width: "100%" }}>
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
									{isEditing ? (
										<Input
											rounded={"xl"}
											variant={"filled"}
											name="address"
											h="30px"
											defaultValue={livecheck.address}
										/>
									) : (
										<Text fontWeight={600} fontSize={"xl"}>
											{livecheck.address}
										</Text>
									)}
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Edition</FormLabel>
									{isEditing ? (
										<Select
											h="30px"
											name="edition"
											rounded={"xl"}
											defaultValue={livecheck.bedrock ? "bedrock" : "java"}
											variant={"filled"}
											cursor={"pointer"}
											sx={{
												"& > *": {
													bg: "bg !important"
												}
											}}
										>
											<option value={"java"}>Java</option>
											<option value={"bedrock"}>Bedrock</option>
										</Select>
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
										h="30px"
										name="channel"
										rounded={"xl"}
										cursor={"pointer"}
										variant={"filled"}
										defaultValue={livecheck.channel_id}
										w={{ base: "100%", md: "lg" }}
										sx={{
											"& > *": {
												bg: "bg !important"
											}
										}}
									>
										{channels.map((channel: { name: string; id: string }) => (
											<Box as="option" cursor={"pointer"} key={channel.id} value={channel.id}>
												#{channel.name}
											</Box>
										))}
									</Select>
								) : (
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.channel_id}
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
									<Input name="address" rounded={"xl"} variant={"filled"} />
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Edition</FormLabel>
									<Select
										name="edition"
										rounded={"xl"}
										variant={"filled"}
										cursor={"pointer"}
										sx={{
											"& > *": {
												bg: "bg !important"
											}
										}}
									>
										<option value={"java"}>Java</option>
										<option value={"bedrock"}>Bedrock</option>
									</Select>
								</VStack>
							</Stack>

							<VStack align={"start"} spacing={0} w={{ base: "100%", md: "lg" }}>
								<FormLabel>Channel</FormLabel>
								<Select
									name="channel"
									rounded={"xl"}
									cursor={"pointer"}
									variant={"filled"}
									sx={{
										"& > *": {
											bg: "bg !important"
										}
									}}
								>
									{channels.map((channel: { name: string; id: string }) => (
										<Box as="option" cursor={"pointer"} key={channel.id} value={channel.id}>
											#{channel.name}
										</Box>
									))}
								</Select>
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
								<Button onClick={() => setIsEditing(!isEditing)} transform={"auto-gpu"} _active={{ scale: 0.9 }}>
									<HStack>
										<EditIcon />
										<Text>{isEditing ? "Cancel editing" : "Edit livecheck"}</Text>
									</HStack>
								</Button>
							</WrapItem>
						)}
					</Wrap>
					{data && !livecheck && (
						<Text fontWeight={600} color={"green"}>
							{data.message}
						</Text>
					)}
					{livecheck && <Text fontSize={"xs"}>Data refreshes automatically every 15 seconds.</Text>}
				</VStack>
			</livecheckFetcher.Form>
		</VStack>
	);
}
