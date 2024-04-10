import { getUser } from "@/.server/db/models/user";
import cache from "@/.server/db/redis";
import { getCounts, getStats } from "@/.server/functions/admin.server";
import { requireEnv } from "@/.server/functions/env.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import { copyObjectWithoutKeys } from "@/functions/utils";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import type { ServerModel } from "@/types/minecraftServer";
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Button,
	Link as ChakraLink,
	Divider,
	Flex,
	Heading,
	Image,
	SimpleGrid,
	Table,
	TableContainer,
	Tbody,
	Text,
	Th,
	Thead,
	Tr,
	Wrap,
	WrapItem
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { typedjson } from "remix-typedjson";

export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);
	const user = await getUser(request);

	if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

	const [counts, stats, bot] = await Promise.all([
		getCounts(),
		getStats(),
		fetch(serverConfig.botApi + "/stats", {
			headers: {
				Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
			}
		})
			.then((res) => res.json())
			.catch(() => null)
	]);

	return typedjson({
		counts,
		stats,
		bot
	});
}

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);
	const user = await getUser(request);
	if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

	const res = await cache.flush().catch((err) => {
		console.error(err);
		return null;
	});

	return typedjson({
		success: res !== null,
		message: res
	});
}

export function shouldRevalidate() {
	return false;
}

export default function DashboardAdmin() {
	const { counts, stats, bot } = useAnimationLoaderData<typeof loader>();

	const flushFetcher = useFetcher();

	// const cpuRef = useRef(null);
	// const cpuCount = useCountUp({
	// 	start: 0,
	// 	end: 0,
	// 	ref: cpuRef,
	// 	duration: 0.5
	// });

	// const [cpuHistory, setCpuHistory] = useState([
	// 	{
	// 		name: new Date().toLocaleTimeString(),
	// 		percent: 0
	// 	}
	// ]);

	// const [usage, setUsage] = useState({
	// 	cpu: 0,
	// 	memory: {
	// 		total: 0,
	// 		used: 0
	// 	}
	// });

	// useEventSourceCallback(
	// 	"/api/admin/sse/usage",
	// 	{
	// 		event: "usage"
	// 	},
	// 	(e) => {
	// 		console.log("e", e);
	// 		setUsage(e);
	// 		cpuCount.update(e.cpu);
	// 		setCpuHistory((prev) => {
	// 			if (prev.length > 10) {
	// 				return [...prev.slice(1), { name: new Date().toLocaleTimeString(), percent: e.cpu }];
	// 			}
	// 			return [...prev, { name: new Date().toLocaleTimeString(), percent: e.cpu }];
	// 		});
	// 	}
	// );

	return (
		<Flex w="100%" flexDir={"column"} gap={10}>
			{/* <Flex border="1px solid" borderColor={"alpha300"} rounded={"xl"} p={4} w="100%" flexDir={"column"}>
				<Flex w="100%" justifyContent={"space-between"}>
					<Flex flexDir={"column"}>
						<Text fontSize={"lg"}>CPU Usage</Text>
						<Text fontSize={"2xl"}>
							<Box as="span" ref={cpuRef} />%
						</Text>
					</Flex>

					<Icon as={FiCpu} boxSize={20} />
				</Flex>
			</Flex>

			<Text fontSize={"2xl"}>
				{usage.memory.used} / {usage.memory.total} MB
			</Text> */}

			<Flex w="100%" justify={"flex-end"}>
				<Text>Flush Redis Cache</Text>

				<flushFetcher.Form method="DELETE">
					<Button variant={"brand"} type="submit" isLoading={flushFetcher.state !== "idle"}>
						Flush Cache
					</Button>
				</flushFetcher.Form>
			</Flex>

			<Flex flexDir={"column"} gap={4}>
				<Heading fontSize={"2xl"}>Counts</Heading>

				<Wrap spacing={4} w="100%">
					{Object.entries(counts).map(([key, value]) => (
						<WrapItem key={key} gap={0.5} display={"flex"} flexDir={"column"} flex={1}>
							<Text fontSize={"lg"}>{camelCaseToTitleCase(key)}</Text>
							<Text fontSize={"2xl"} fontWeight={600}>
								{value}
							</Text>
						</WrapItem>
					))}
				</Wrap>
			</Flex>

			<Divider />

			<Flex flexDir={"column"} gap={4}>
				<Heading fontSize={"2xl"}>Last Stats</Heading>

				<Flex w="100%" flexDir={"column"}>
					<Accordion w="100%" allowToggle>
						<AccordionItem>
							<AccordionButton>
								<Box as="span" flex="1" textAlign="left">
									Last Checks
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>Id</Th>
													<Th>Server</Th>
													<Th>Status</Th>
													<Th>Source</Th>
													<Th isNumeric>Players</Th>
													<Th>Bedrock</Th>
													<Th>IP</Th>
													<Th isNumeric>Checked At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.checks.map((check) => (
													<Tr key={`check-` + check.id}>
														<Th>{check.id}</Th>
														<Th>
															<Link variant={"link"} to={`/${check.Server.server}`}>
																{check.Server.server}
															</Link>
														</Th>
														<Th>{check.online ? "Online" : "Offline"}</Th>
														<Th>{check.source}</Th>
														<Th isNumeric>{check.players}</Th>
														<Th>{check.Server.bedrock ? "Bedrock" : "Java"}</Th>
														<Th>{check.client_ip}</Th>
														<Th isNumeric>{new Date(check.checked_at).toLocaleString()}</Th>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</Flex>
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<AccordionButton>
								<Box as="span" flex="1" textAlign="left">
									Bookmarked Servers
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>Id</Th>
													<Th>Icon</Th>
													<Th>Server</Th>
													<Th>Status</Th>
													<Th>Players</Th>
													<Th>Bedrock</Th>
													<Th>Created At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.savedServers.map((server) => (
													<Tr key={`server-` + server.id}>
														<Th>{server.id}</Th>
														<Th>
															<Image
																src={server.Server.favicon ?? ""}
																boxSize={10}
																rounded={"md"}
															/>
														</Th>
														<Th>
															<Link variant={"link"} to={`/${server.Server.server}`}>
																{server.Server.server}
															</Link>
														</Th>
														<Th>{server.Server.online ? "Online" : "Offline"}</Th>
														<Th>
															{
																(server.Server.players as unknown as ServerModel.Players<false>)
																	?.online
															}
														</Th>
														<Th>{server.Server.bedrock ? "Bedrock" : "Java"}</Th>
														<Th>{new Date(server.created_at).toLocaleString()}</Th>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</Flex>
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<AccordionButton>
								<Box as="span" flex="1" textAlign="left">
									Comments
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>Id</Th>
													<Th>Server</Th>
													<Th>Content</Th>
													<Th>Created At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.comments.map((comment) => (
													<Tr key={`comment-` + comment.id}>
														<Th>{comment.id}</Th>
														<Th>{comment.Server.server}</Th>
														<Th>{comment.content}</Th>
														<Th>{new Date(comment.created_at).toLocaleString()}</Th>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</Flex>
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<AccordionButton>
								<Box as="span" flex="1" textAlign="left">
									Users
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>Id</Th>
													<Th>Photo</Th>
													<Th>Nick</Th>
													<Th>Email</Th>
													<Th>Snowflake</Th>
													<Th>Created At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.users.map((user) => (
													<Tr key={`user-` + user.id}>
														<Th>{user.id}</Th>
														<Th>
															<Image boxSize={10} rounded={"md"} src={user.photo ?? ""} />
														</Th>
														<Th>{user.nick}</Th>
														<Th>{user.email}</Th>
														<Th>{user.snowflake}</Th>
														<Th>{new Date(user.created_at).toLocaleString()}</Th>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</Flex>
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<AccordionButton>
								<Box as="span" flex="1" textAlign="left">
									Votes
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>Id</Th>
													<Th>Server</Th>
													<Th>Nick</Th>
													<Th>Reward Collected</Th>
													<Th>Created At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.votes.map((vote) => (
													<Tr key={`vote-` + vote.id}>
														<Th>{vote.id}</Th>
														<Th>{vote.Server.server}</Th>
														<Th>{vote.nick}</Th>
														<Th>{vote.reward_collected}</Th>
														<Th>{new Date(vote.created_at).toLocaleString()}</Th>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</Flex>
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<AccordionButton>
								<Box as="span" flex="1" textAlign="left">
									Verified servers
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>Id</Th>
													<Th>Server</Th>
													<Th>Owner</Th>
													<Th>Banner</Th>
													<Th>Verified At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.verifiedServers.map((server) => (
													<Tr key={`verified-server-` + server.id}>
														<Th>{server.id}</Th>
														<Th>{server.server}</Th>
														<Th>{server.Owner?.nick ?? "Not verified"}</Th>
														<Th>
															<ChakraLink href={server.banner ?? ""} isExternal>
																{server.banner ? server.banner + ".webp" : "No banner"}
															</ChakraLink>
														</Th>
														<Th>
															{server.Verification.find((v) => v.success)?.success
																? new Date(
																		server.Verification.find((v) => v.success)!.verified_at!
																  ).toLocaleString()
																: ""}
														</Th>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</Flex>
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</Flex>
			</Flex>

			{bot && (
				<Flex flexDir={"column"} gap={4}>
					<Heading fontSize={"2xl"}>Bot Stats</Heading>

					<Heading fontSize={"lg"}>Guilds</Heading>
					<Wrap justifyContent={"space-between"} w="100%" alignItems={"center"} gap={4}>
						{bot.biggestGuilds.map((guild: { id: string; name: string; memberCount: number; icon: string }) => {
							return (
								<Flex key={guild.id} flexDir={"column"} gap={2}>
									<Image src={guild.icon} boxSize={20} rounded={"md"} />
									<Text fontWeight={600}>{guild.name}</Text>
									<Text>{guild.memberCount} members</Text>
								</Flex>
							);
						})}
					</Wrap>

					<Heading fontSize={"lg"}>Stats</Heading>
					<SimpleGrid columns={2} gap={4}>
						{Object.entries(copyObjectWithoutKeys(bot, ["biggestGuilds"])).map(([key, value]: [any, any]) => (
							<Flex
								key={key}
								flexDir={"column"}
								gap={1}
								p={4}
								border="1px solid"
								borderColor={"alpha300"}
								rounded={"xl"}
							>
								<Text fontWeight={500}>{camelCaseToTitleCase(key)}</Text>
								<Text fontWeight={600} fontSize={"2xl"}>
									{value}
								</Text>
							</Flex>
						))}
					</SimpleGrid>
				</Flex>
			)}
		</Flex>
	);
}

function camelCaseToTitleCase(input: string): string {
	const words = input.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
	const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));

	return capitalizedWords.join(" ");
}
