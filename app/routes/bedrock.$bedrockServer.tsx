import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
	Box,
	Divider,
	Flex,
	Heading,
	HStack,
	Icon,
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
import { getClientIPAddress } from "remix-utils/build/server/get-client-ip-address";
import ChecksTable from "~/components/layout/server/ChecksTable";
import { db } from "~/components/server/db/db.server";
import { type BedrockServer } from "~/components/types/minecraftServer";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import { context } from "~/components/utils/GlobalContext";
import Link from "~/components/utils/Link";

export async function loader({ params, request }: LoaderArgs) {
	const server = params.bedrockServer?.toString().toLowerCase();
	if (!server?.includes("."))
		throw new Response(null, {
			status: 404
		});

	if (!process.env.API_TOKEN) throw new Error("API_TOKEN is not definied!");

	const data: any = await (
		await fetch(`https://api.ismcserver.online/bedrock/${server}`, {
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
				bedrock: true,
				source: "WEB",
				client_ip: IP,
				token_id: token_id
			}
		});
	}

	const checks = await db.check.findMany({
		where: {
			server: {
				contains: server
			},
			bedrock: true
		},
		select: {
			id: false,
			server: false,
			online: true,
			players: true,
			source: true,
			client_ip: false,
			checked_at: true
		},
		orderBy: {
			id: "desc"
		},
		take: 20
	});

	return json({ server, data, checks });
}

export const meta: MetaFunction = ({ data }: { data: { server: string; data: BedrockServer } }) => {
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

	const motd = data.motd.html?.split("\n");
	const bgImageColor = "rgba(0,0,0,.7)";

	const { updateData } = useContext(context);
	useEffect(() => {
		updateData("gradientColor", data.online ? "green" : "red");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<VStack spacing={"40px"} align="start" maxW="1000px" mx="auto" w="100%" mt={"50px"} px={4} mb={5}>
			{/* Box up */}
			<Stack direction={{ base: "column", md: "row" }} spacing={5} justifyContent={"space-between"} w="100%">
				<VStack spacing={4} flexDir={"column"} justifyContent="center" w="100%" h="170px" align={"center"}>
					<Flex flexDir={"row"} alignItems="center" justifyContent={"space-between"} w="100%">
						<HStack as={"a"} target="_blank" href={`http://${server}`}>
							<Heading fontSize={{ base: "md", sm: "2xl", md: "4xl" }} letterSpacing={"3px"}>
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
						rounded={"3xl"}
						justifyContent="center"
						align={"center"}
						alignItems="center"
					>
						<pre>
							{motd?.map((m: string) => (
								<Flex
									key={m}
									dangerouslySetInnerHTML={{ __html: m }}
									w="100%"
									maxW={"100%"}
									overflowX={"auto"}
									fontFamily={"mono"}
									justifyContent="center"
									align={"center"}
									alignItems="center"
									fontSize={"sm"}
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

			<VStack spacing={"30px"} align="start" fontWeight={600} w="100%" maxW={"100%"}>
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
									<Td fontWeight={"normal"}>{data.version}</Td>
								</Tr>
								<Tr>
									<Td>Edition</Td>
									<Td fontWeight={"normal"}>{data.edition}</Td>
								</Tr>
								<Tr>
									<Td>Gamemode</Td>
									<Td fontWeight={"normal"}>{data.gamemode.name}</Td>
								</Tr>
							</Tbody>
						</Table>
					</TableContainer>
				</Flex>

				<Heading as={"h2"} fontSize="lg">
					Debug info
				</Heading>

				<Box>
					<TableContainer>
						<Table variant={"unstyled"} size={"sm"}>
							<Tbody>
								<Tr>
									<Td>Host</Td>
									<Td fontWeight={"normal"}>{data.host}</Td>
								</Tr>
								<Tr>
									<Td>Port</Td>
									<Td fontWeight={"normal"}>{data.port.ipv4}</Td>
								</Tr>
								<Tr>
									<Td>Protocol</Td>
									<Td fontWeight={"normal"}>{data.protocol}</Td>
								</Tr>
								<Tr>
									<Td>Guid</Td>
									<Td fontWeight={"normal"}>{data.guid}</Td>
								</Tr>
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			</VStack>

			<Divider />

			<VStack align={"start"} w="100%">
				<Heading as={"h2"} fontSize="lg">
					Last checks
				</Heading>

				{/* @ts-ignore */}
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
		</VStack>
	);
}
