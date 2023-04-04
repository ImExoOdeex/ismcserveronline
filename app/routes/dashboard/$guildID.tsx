import { Button, FormLabel, HStack, Heading, Icon, Image, Stack, Text, VStack, Code, Input, Select, Box } from "@chakra-ui/react";
import { fetch, json, type LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { useRef, useEffect, useState } from "react";
import BotNotOnServer from "~/components/layout/dashboard/BotNotOnServer";
import { TbTrash } from "react-icons/tb";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { HiRefresh } from "react-icons/hi";

export async function loader({ params }: LoaderArgs) {
	const guildID = params.guildID!;

	const [guild, livecheck, channels] = await Promise.all([
		fetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/guild/${guildID}`,
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
			}/livecheck/${guildID}`,
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
			}/channels/${guildID}`,
			{
				method: "get",
				headers: {
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				}
			}
		).then((res) => res.json())
	]);

	return json({ guild: guild.guild, livecheck, channels });
}

export default function $guildID() {
	const lastGuild = useRef({});
	const lastLivecheck = useRef(null);
	const lastChannels = useRef([]);
	const { guild, livecheck, channels } = useLoaderData<typeof loader>() || {
		guild: lastGuild.current,
		livecheck: lastLivecheck.current,
		channels: lastChannels.current
	};
	useEffect(() => {
		if (guild) lastGuild.current = guild;
		if (livecheck) lastLivecheck.current = livecheck;
		if (channels) lastChannels.current = channels;
	}, [guild, livecheck, channels]);

	const liveCheckToggleFetcher = useFetcher();
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const { revalidate, state } = useRevalidator();

	useEffect(() => {
		const interval = setInterval(revalidate, 15000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!guild?.name) {
		return <BotNotOnServer />;
	}

	return (
		<VStack w="100%" align={"start"} spacing={10}>
			<HStack spacing={5}>
				<Image
					rounded={"full"}
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=256`}
					alt={guild.name + "'s icon"}
					boxSize={"16"}
				/>
				<Heading>{guild.name}</Heading>
			</HStack>

			<liveCheckToggleFetcher.Form
				action={`${
					process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online/" : "http://localhost:3004/"
				}livecheck/edit`}
				style={{ width: "100%" }}
			>
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
								spacing={10}
								justifyContent={"start"}
								alignItems={"start"}
								w="lg"
							>
								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Address</FormLabel>
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.address}
									</Text>
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Edition</FormLabel>
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.bedrock ? "Bedrock" : "Java"}
									</Text>
								</VStack>
							</Stack>

							<VStack w="100%" align={"start"} spacing={0}>
								<FormLabel>Channel Id</FormLabel>
								<Text fontWeight={600} fontSize={"xl"}>
									{livecheck.channel_id}
								</Text>
							</VStack>

							<Stack
								direction={{ base: "column", md: "row" }}
								spacing={10}
								justifyContent={"start"}
								alignItems={"start"}
								w="lg"
							>
								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Last status</FormLabel>
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.last_status}
									</Text>
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Last players</FormLabel>
									<Text fontWeight={600} fontSize={"xl"}>
										{livecheck.last_players}
									</Text>
								</VStack>
							</Stack>
						</>
					) : (
						<>
							<Stack
								direction={{ base: "column", md: "row" }}
								spacing={10}
								justifyContent={"start"}
								alignItems={"start"}
								w="lg"
							>
								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Address</FormLabel>
									<Input rounded={"xl"} variant={"filled"} />
								</VStack>

								<VStack w="100%" align={"start"} spacing={0}>
									<FormLabel>Edition</FormLabel>
									<Select
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

							<VStack align={"start"} spacing={0} w="lg">
								<FormLabel>Channel</FormLabel>
								<Select
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

					<HStack>
						{livecheck && (
							<Button isLoading={state === "loading"} onClick={revalidate} variant={"brand"}>
								<HStack>
									<Icon as={HiRefresh} />
									<Text>Refresh data</Text>
								</HStack>
							</Button>
						)}
						<Button
							type="submit"
							name="_action"
							value={"toggle"}
							colorScheme={livecheck ? "red" : "green"}
							_hover={{ bg: livecheck ? "red.700" : "green.600" }}
							_active={{ bg: livecheck ? "red.800" : "green.700" }}
							bg={livecheck ? "red.500" : "green.500"}
							color={livecheck ? "white" : "white"}
						>
							<HStack>
								{livecheck ? <Icon as={TbTrash} /> : <AddIcon />}
								<Text>{livecheck ? "Disable" : "Enable"} livecheck</Text>
							</HStack>
						</Button>
						{livecheck && (
							<Button onClick={() => setIsEditing(!isEditing)}>
								<HStack>
									<EditIcon />
									<Text>{isEditing ? "Cancel editing" : "Edit livecheck"}</Text>
								</HStack>
							</Button>
						)}
					</HStack>
					{livecheck && <Text fontSize={"xs"}>Data refreshes automatically every 15 seconds.</Text>}
				</VStack>
			</liveCheckToggleFetcher.Form>
		</VStack>
	);
}
