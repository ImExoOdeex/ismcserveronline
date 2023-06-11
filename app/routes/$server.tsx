import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
	Box,
	Divider,
	Flex,
	Heading,
	HStack,
	Icon,
	Image,
	Stack,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Tr,
	VStack
} from "@chakra-ui/react";
import { fetch, json, type LoaderArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useContext, useEffect, useRef } from "react";
import { BiBug, BiInfoCircle } from "react-icons/bi";
import { getClientIPAddress } from "remix-utils";
import { Ad, adType } from "~/components/ads/Ad";
import ChecksTable from "~/components/layout/server/ChecksTable";
import { db } from "~/components/server/db/db.server";
import { type MinecraftServerWoQuery } from "~/components/types/minecraftServer";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import { context } from "~/components/utils/GlobalContext";
import Link from "~/components/utils/Link";

export async function loader({ params, request }: LoaderArgs) {
	const server = params.server?.toString().toLowerCase();
	if (!server?.includes("."))
		throw new Response("Not found", {
			status: 404
		});

	if (server.endsWith(".php")) {
		throw new Response("Not found", {
			status: 404
		});
	}

	if (!process.env.API_TOKEN) throw new Error("API_TOKEN is not definied!");

	const data: any = await (
		await fetch(`https://api.ismcserver.online/${server}`, {
			method: "get",
			headers: [["Authorization", process.env.API_TOKEN]]
		})
	).json();

	const cookie = getCookieWithoutDocument("tracking", request.headers.get("cookie") ?? "");
	const blockTracking = cookie == "no-track" ? true : false;

	if (!blockTracking && data) {
		const IP = getClientIPAddress(request.headers);

		const token_id = (
			await db.token.findUnique({
				where: {
					token: process.env.API_TOKEN
				}
			})
		)?.id;
		if (!token_id) throw new Error("There's no valid API token!");

		await db.check.create({
			data: {
				server: server,
				online: data.online,
				players: data.players.online,
				bedrock: false,
				source: "WEB",
				client_ip: IP,
				token_id: token_id
			}
		});
	}

	const url = new URL(request.url);
	const c = url.searchParams.get("page") || 0;

	const checks = await db.check.findMany({
		where: {
			server: {
				contains: server
			},
			bedrock: false
		},
		select: {
			id: true,
			server: false,
			online: true,
			players: true,
			source: true,
			checked_at: true
		},
		orderBy: {
			id: "desc"
		},
		take: 20,
		skip: Number(c) || 0
	});

	return json({ server, data, checks });
}

export const meta: MetaFunction = ({ data }: { data: { server: string; data: MinecraftServerWoQuery } }) => {
	return {
		title: data.server + "'s status | IsMcServer.online"
	};
};

export default function $server() {
	const lastServer = useRef({});
	const lastData = useRef({});
	const lastChecks = useRef({});
	const { server, data, checks }: any = useLoaderData<typeof loader>() || {
		server: lastServer.current,
		data: lastData.current,
		checks: lastChecks.current
	};
	useEffect(() => {
		if (server) lastServer.current = server;
		if (data) lastData.current = data;
		if (checks) lastChecks.current = checks;
	}, [server, data, checks]);

	const bgImageColor = "rgba(0,0,0,.7)";

	const { updateData } = useContext(context);
	useEffect(() => {
		updateData("gradientColor", data.online ? "green" : "red");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<VStack spacing={"40px"} align="start" maxW="1000px" mx="auto" w="100%" mt={"50px"} px={4} mb={5}>
			<Ad type={adType.small} width={"968px"} />
			<>
				<Stack direction={{ base: "column", md: "row" }} spacing={5} justifyContent={"space-between"} w="100%">
					{data.favicon && (
						<Image
							src={data.favicon ?? ""}
							alt={`${server} favicon`}
							boxSize="170px"
							sx={{ imageRendering: "pixelated" }}
						/>
					)}

					<VStack spacing={4} flexDir={"column"} justifyContent="center" w="100%" h="170px" align={"center"}>
						<Flex flexDir={"row"} alignItems="center" justifyContent={"space-between"} w="100%">
							<HStack as={"a"} target="_blank" href={`http://${server}`}>
								<Heading
									fontSize={{
										base: "md",
										sm: "2xl",
										md: "4xl"
									}}
									letterSpacing={"3px"}
								>
									{server}
								</Heading>
								<ExternalLinkIcon fontSize={"lg"} />
							</HStack>
							<HStack spacing={2}>
								<Box
									boxSize={"10px"}
									rounded="full"
									shadow={`0px 0px 20px ${data.online ? "#38A169" : "#E53E3E"}`}
									bg={data.online ? "green.500" : "red.500"}
								/>
								<Heading
									textShadow={"0px 0px 15px"}
									fontSize="lg"
									letterSpacing={"3px"}
									color={data.online ? "green.500" : "red.500"}
								>
									{data.online ? "Online" : "Offline"}
								</Heading>
							</HStack>
						</Flex>

						<Flex
							py={4}
							flexDir={"column"}
							w="100%"
							pos="relative"
							maxW={"100%"}
							overflowX={"auto"}
							rounded={"3xl"}
							justifyContent="center"
							align={"center"}
							alignItems="center"
						>
							<pre>
								{data?.motd?.html?.split("\n")?.map((m: string) => (
									<Flex
										key={m}
										dangerouslySetInnerHTML={{
											__html: m
										}}
										w="100%"
										fontFamily={"mono"}
										justifyContent="center"
										align={"center"}
										alignItems="center"
										fontSize={"md"}
										fontWeight={"normal"}
									/>
								))}
							</pre>

							<Box
								rounded={"xl"}
								zIndex={-1}
								pos={"absolute"}
								top="0"
								left="0"
								right="0"
								bottom={"0"}
								bgImage={`linear-gradient(${bgImageColor}, ${bgImageColor}), url(/dirt.png)`}
								bgRepeat={"repeat"}
								bgSize="30px"
							/>
						</Flex>
					</VStack>
				</Stack>

				<Divider />

				<VStack spacing={"20px"} align="start" fontWeight={600} w="100%" maxW={"100%"}>
					<Heading as={"h2"} fontSize="lg">
						General info
					</Heading>

					<Flex overflowX={"auto"} w="100%" maxW={"100%"} pos={"relative"}>
						<TableContainer>
							<Table variant={"unstyled"} size={"sm"}>
								<Tbody>
									<Tr>
										<Td>Players</Td>
										<Td fontWeight={"normal"}>
											{data.players.online} / {data.players.max}
										</Td>
									</Tr>
									<Tr>
										<Td>Version</Td>
										<Td fontWeight={"normal"}>{data.version?.string}</Td>
									</Tr>
									<Tr>
										<Td>Ping</Td>
										<Td fontWeight={"normal"} fontFamily={"mono"}>
											{data.ping} miliseconds
										</Td>
									</Tr>
									<Tr>
										<Td>Players</Td>
										{data.players?.list?.length ? (
											<>
												{data.players.list.map(
													(
														p:
															| {
																	id: number;
																	name: string;
															  }
															| any
													) => {
														return (
															<Td fontWeight={"normal"} key={p.id}>
																{p.name}
															</Td>
														);
													}
												)}
											</>
										) : (
											<Td fontWeight={"normal"} color={"textSec"}>
												Unable to get
											</Td>
										)}
									</Tr>
								</Tbody>
							</Table>
						</TableContainer>
					</Flex>

					<Heading as={"h2"} fontSize="lg">
						Debug info
					</Heading>

					<Flex overflowX={"auto"} w="100%" maxW={"100%"} pos={"relative"}>
						<TableContainer>
							<Table variant={"unstyled"} size={"sm"}>
								<Tbody>
									<Tr>
										<Td>Host</Td>
										<Td fontWeight={"normal"}>{data.host}</Td>
									</Tr>
									<Tr>
										<Td>Port</Td>
										<Td fontWeight={"normal"}>{data.port}</Td>
									</Tr>
									<Tr>
										<Td>Protocol</Td>
										<Td fontWeight={"normal"}>{data.protocol}</Td>
									</Tr>
									<Tr>
										<Td>Software</Td>
										<Td fontWeight={"normal"}>{data.software}</Td>
									</Tr>
								</Tbody>
							</Table>
						</TableContainer>
					</Flex>
				</VStack>
			</>

			<Divider />

			<VStack align={"start"} w="100%">
				<Heading as={"h2"} fontSize="lg">
					Last checks
				</Heading>

				{/* @ts-ignore, idk this fucking serialize object does not work */}
				<ChecksTable checks={checks} server={server} />
			</VStack>

			<Stack direction={{ base: "column", md: "row" }} spacing={{ base: "auto", md: 7 }}>
				<HStack
					as={"a"}
					href="https://github.com/ImExoOdeex/ismcserveronline/issues"
					color={"textSec"}
					fontWeight={500}
					_hover={{ textDecor: "none", color: "initial" }}
				>
					<Text>Found bug?</Text>
					<Icon as={BiBug} />
				</HStack>
				<HStack as={Link} to="/faq" color={"textSec"} fontWeight={500} _hover={{ textDecor: "none", color: "initial" }}>
					<Text>Frequently asked questions</Text>
					<Icon as={BiInfoCircle} />
				</HStack>
			</Stack>
			<Ad type={adType.multiplex} />
		</VStack>
	);
}
