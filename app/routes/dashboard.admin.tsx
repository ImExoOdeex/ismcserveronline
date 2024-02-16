import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Divider,
	Flex,
	Heading,
	Image,
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
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { getUser } from "~/components/server/db/models/user";
import { getCounts, getStats } from "~/components/server/functions/admin.server";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader({ request }: LoaderFunctionArgs) {
	const [user, counts, stats] = await Promise.all([getUser(request), getCounts(), getStats()]);

	if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

	return typedjson({
		counts,
		stats
	});
}

export default function DashboardAdmin() {
	const { counts, stats } = useAnimationLoaderData<typeof loader>();

	return (
		<Flex w="100%" flexDir={"column"} gap={10}>
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
													<Th>ID</Th>
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
													<Tr>
														<Th>{check.id}</Th>
														<Th>{check.server}</Th>
														<Th>{check.online ? "Online" : "Offline"}</Th>
														<Th>{check.source}</Th>
														<Th isNumeric>{check.players}</Th>
														<Th>{check.bedrock ? "Bedrock" : "Java"}</Th>
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
									Saved Servers
								</Box>
								<AccordionIcon />
							</AccordionButton>
							<AccordionPanel pb={4}>
								<Flex display={"flex"} flexDir={"column"}>
									<TableContainer>
										<Table variant="simple">
											<Thead>
												<Tr>
													<Th>ID</Th>
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
													<Tr>
														<Th>{server.id}</Th>
														<Th>
															<Image src={server.icon ?? ""} boxSize={10} rounded={"md"} />
														</Th>
														<Th>{server.server}</Th>
														<Th>{server.online ? "Online" : "Offline"}</Th>
														<Th>{server.players}</Th>
														<Th>{server.bedrock ? "Bedrock" : "Java"}</Th>
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
													<Th>ID</Th>
													<Th>Server</Th>
													<Th>Content</Th>
													<Th>Created At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.comments.map((comment) => (
													<Tr>
														<Th>{comment.id}</Th>
														<Th>{comment.server}</Th>
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
													<Th>ID</Th>
													<Th>Photo</Th>
													<Th>Nick</Th>
													<Th>Email</Th>
													<Th>Snowflake</Th>
													<Th>Created At</Th>
												</Tr>
											</Thead>
											<Tbody>
												{stats.users.map((user) => (
													<Tr>
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
					</Accordion>
				</Flex>
			</Flex>
		</Flex>
	);
}

function camelCaseToTitleCase(input: string): string {
    const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    return capitalizedWords.join(' ');
}
