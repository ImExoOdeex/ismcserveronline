import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Divider,
	Flex,
	Heading,
	HStack,
	Icon,
	Image,
	Spinner,
	Stack,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Tr,
	useToast,
	VStack
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BiBookmark, BiBug, BiInfoCircle } from "react-icons/bi/index.js";
import { typedjson } from "remix-typedjson";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { Ad, adType } from "~/components/ads/Yes";
import ChecksTable from "~/components/layout/server/ChecksTable";
import Comments from "~/components/layout/server/Comments";
import { authenticator } from "~/components/server/auth/authenticator.server";
import { Info, sendCommentWebhook, sendDeleteCommentWebhook, sendReportWebhook } from "~/components/server/auth/webhooks";
import { db } from "~/components/server/db/db.server";
import { getUser, getUserId } from "~/components/server/db/models/user";
import { requireAPIToken } from "~/components/server/functions/env.server";
import serverConfig from "~/components/server/serverConfig.server";
import { MinecraftServer, MinecraftServerWoQuery } from "~/components/types/minecraftServer";
import { getCookieWithoutDocument } from "~/components/utils/functions/cookies";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";
import useUser from "~/components/utils/hooks/useUser";
import Link from "~/components/utils/Link";

export async function action({ request, params }: ActionFunctionArgs) {
	const form = await request.formData();
	const action = form.get("action");

	switch (action) {
		case "query":
			throw redirect(`?query`);
		case "comment": {
			const content = form.get("content")?.toString();
			const server = params.server!.toString().toLowerCase();

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				if (!content) throw new Error("Content is not definied!");
				if (content.trim().length < 5) throw new Error("Content is too short!");
				if (content.trim().length > 250) throw new Error("Content is too long!");

				const hasCommented = await db.comment.findFirst({
					where: {
						user_id: user.id,
						server: server,
						bedrock: false
					}
				});
				if (hasCommented) throw new Error("You have already commented on this server!");

				// allow user to comment only 10 times per day.
				const comments = await db.comment.findMany({
					where: {
						user_id: user.id,
						created_at: {
							gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
						}
					}
				});
				if (comments.length >= 10) throw new Error("You have reached the limit of comments per day!");
			} catch (e: any) {
				return typedjson({
					error: e.message
				});
			}

			const newComment = await db.comment.create({
				data: {
					content,
					server,
					bedrock: false,
					user_id: user.id
				}
			});

			sendCommentWebhook(user, content, server, new Info(request.headers));

			return typedjson({
				success: true,
				comment: {
					id: newComment.id,
					content,
					created_at: newComment.created_at,
					updated_at: newComment.updated_at,
					user: {
						nick: user.nick,
						photo: user.photo,
						id: user.id
					}
				}
			});
		}
		case "edit": {
			const content = form.get("content")?.toString();
			const id = form.get("id")?.toString();
			const server = params.server!.toString().toLowerCase();

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				if (!content) throw new Error("Content is not definied!");
				if (content.trim().length < 5) throw new Error("Content is too short!");
				if (content.trim().length > 250) throw new Error("Content is too long!");
				if (!id) throw new Error("ID is not definied!");

				const comment = await db.comment.findFirst({
					where: {
						id: Number(id),
						server: server,
						bedrock: false
					}
				});
				if (!comment) throw new Error("Comment is not found!");

				if (comment.user_id !== user.id) throw new Error("You are not owner of this comment!");
			} catch (e: any) {
				return typedjson({
					error: e.message
				});
			}

			const newComment = await db.comment.update({
				where: {
					id: Number(id)
				},
				data: {
					content: content
				}
			});

			return typedjson({
				success: true,
				comment: {
					id: newComment.id,
					content,
					created_at: newComment.created_at,
					updated_at: newComment.updated_at,
					user: {
						nick: user.nick,
						photo: user.photo,
						id: user.id
					}
				}
			});
		}
		case "delete": {
			const id = form.get("id")?.toString();
			const server = params.server!.toString().toLowerCase();

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				if (!id) throw new Error("ID is not definied!");

				const comment = await db.comment.findFirst({
					where: {
						id: Number(id),
						server: server,
						bedrock: false
					}
				});
				if (!comment) throw new Error("Comment is not found!");

				if (comment.user_id !== user.id) throw new Error("You are not owner of this comment!");
			} catch (e: any) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return typedjson({
					error: e.message,
					success: false
				});
			}

			const deletedComment = await db.comment.delete({
				where: {
					id: Number(id)
				}
			});

			sendDeleteCommentWebhook(user, deletedComment.content, server, new Info(request.headers));

			return typedjson({
				success: true
			});
		}
		case "report": {
			const id = form.get("id")?.toString();
			const server = params.server!.toString().toLowerCase();

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				if (!id) throw new Error("ID is not definied!");

				const comment = await db.comment.findFirst({
					where: {
						id: Number(id),
						server: server,
						bedrock: false
					}
				});
				if (!comment) throw new Error("Comment is not found!");

				if (comment.user_id === user.id) throw new Error("You can't report your own comment!");

				await sendReportWebhook(user, comment, server, new Info(request.headers));
			} catch (e: any) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return typedjson({
					error: e.message,
					success: false
				});
			}

			return typedjson({
				success: true
			});
		}
		case "save": {
			const server = params.server!.toString().toLowerCase();

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				const favicon = form.get("favicon")?.toString();
				const players = Number(form.get("players")?.toString());
				const online = Boolean(form.get("online")?.toString());

				const hasSaved = await db.savedServer.findFirst({
					where: {
						user_id: user.id,
						server: server,
						bedrock: false
					}
				});
				if (hasSaved) {
					await db.savedServer.delete({
						where: {
							id: hasSaved.id
						}
					});
				} else {
					await db.savedServer.create({
						data: {
							server: server,
							user_id: user.id,
							icon: favicon,
							players,
							online,
							bedrock: false
						}
					});
				}
			} catch (e: any) {
				return typedjson({
					error: e.message
				});
			}

			return typedjson({
				success: true
			});
		}
		default: {
			throw new Error("Action is not definied!");
		}
	}
}

export async function loader({ params, request }: LoaderFunctionArgs) {
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

	const url = new URL(request.url);
	const c = url.searchParams.get("page") || 0;
	const query = url.searchParams.get("query") === "";

	const data: MinecraftServer | MinecraftServerWoQuery = await fetch(`${serverConfig.api}/${query ? "query/" : ""}${server}`, {
		method: "GET",
		headers: [["Authorization", requireAPIToken()]]
	}).then((r) => r.json());

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

	const isAuth = await authenticator.isAuthenticated(request);
	const [checks, comments, isSaved] = await Promise.all([
		db.check.findMany({
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
		}),
		db.comment.findMany({
			where: {
				server: {
					contains: server
				},
				bedrock: false
			},
			select: {
				id: true,
				content: true,
				created_at: true,
				updated_at: true,
				user: {
					select: {
						nick: true,
						photo: true,
						id: true
					}
				}
			},
			orderBy: {
				created_at: "desc"
			}
		}),
		isAuth
			? db.savedServer
					.findFirst({
						where: {
							server: server,
							user_id: (await getUserId(request))!,
							bedrock: false
						}
					})
					.then((s) => (s ? true : false))
			: false
	]);

	return typedjson({ server, data, checks, query, comments, isSaved });
}

export function meta({ data, matches }: MetaArgs) {
	return [
		{
			title: (data as any).server + "'s status | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formData, currentParams, nextParams }) => {
	if (!formData) return false;
	if (formData.get("action") === "query" || currentParams.server !== nextParams.server) return true;

	return false;
};

export default function $server() {
	const { server, data, checks, query, isSaved, comments: dbComments } = useAnimationLoaderData<typeof loader>();

	const bgImageColor = "rgba(0,0,0,.7)";

	const fetcher = useFetcher();
	const busy = fetcher.state !== "idle";

	const tabs = [
		{
			name: "Checks",
			value: "checks"
		},
		{
			name: "Comments",
			value: "comments"
		}
	] as const;

	const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("checks");

	const [comments, setComments] = useState(dbComments);

	const [saved, setSaved] = useState(isSaved);

	const saveFetcher = useFetcher();
	const user = useUser();
	const navigate = useNavigate();

	const toast = useToast();
	useEffect(() => {
		if ((saveFetcher.data as any)?.success) {
			toast({
				title: "Successfully saved server!",
				duration: 9000,
				variant: "subtle",
				isClosable: true,
				status: "success",
				position: "bottom-right"
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saveFetcher.data]);

	function handleSave() {
		if (user) {
			setSaved((prev) => !prev);
			saveFetcher.submit(
				{
					action: "save",
					favicon: data?.favicon,
					players: data?.players?.online,
					online: data?.online
				},
				{
					method: "PATCH"
				}
			);
		} else {
			navigate("/login");
		}
	}

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
									{query && (
										<Tr>
											<Td>Map</Td>
											<Td fontWeight={"normal"} color={(data as MinecraftServer)?.map ? "text" : "textSec"}>
												{(data as MinecraftServer)?.map ? (data as MinecraftServer).map : "Unable to get"}
											</Td>
										</Tr>
									)}
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
									{query && (
										<Tr>
											<Td>Plugins</Td>
											{(data as MinecraftServer).plugins?.length ? (
												<>
													{(data as MinecraftServer).plugins.map((p: string) => {
														return (
															<Td fontWeight={"normal"} key={p}>
																{p}
															</Td>
														);
													})}
												</>
											) : (
												<Td fontWeight={"normal"} color={"textSec"}>
													Unable to get
												</Td>
											)}
										</Tr>
									)}
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
									{query && (
										<Tr>
											<Td>IP</Td>
											<Td fontWeight={"normal"} color={(data as MinecraftServer)?.ip ? "text" : "textSec"}>
												{(data as MinecraftServer)?.ip ? (data as MinecraftServer).ip : "Unable to get"}
											</Td>
										</Tr>
									)}
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

					{!query && (
						<fetcher.Form method="POST">
							<Text color="textSec" fontWeight={400}>
								Misleading information?{" "}
								<Button
									variant={"unstyled"}
									type="submit"
									fontWeight={500}
									textDecor="underline"
									color={"sec"}
									h="min-content"
									name="action"
									value="query"
								>
									Try searching with Query!
								</Button>
								{busy && <Spinner color="sec" size={"xs"} ml={2} />}
							</Text>
						</fetcher.Form>
					)}
				</VStack>
			</>

			<Divider />

			<Flex justifyContent={"space-between"} w="100%" alignItems={"center"}>
				<Flex gap={2}>
					{tabs.map((t) => (
						<Button
							boxShadow={"sm"}
							key={t.value}
							onClick={() => setTab(t.value)}
							size={"sm"}
							rounded={"xl"}
							bg={tab === t.value ? "brand.500" : "transparent"}
							color={tab === t.value ? "white" : "text"}
							fontWeight={500}
							border="1px solid"
							borderColor={tab === t.value ? "transparent" : "alpha300"}
							px={4}
							py={4}
							_hover={{
								bg: tab === t.value ? "brand.600" : "alpha100"
							}}
						>
							{t.name}
						</Button>
					))}
				</Flex>

				<Button
					size={"sm"}
					py={4}
					variant={saved ? "solid" : "outline"}
					borderColor={"yellow.500"}
					bg={saved ? "yellow.500" : "transparent"}
					rightIcon={<Icon as={BiBookmark} color={saved ? "white" : "yellow.500"} boxSize={5} />}
					color={saved ? "white" : "text"}
					onClick={handleSave}
					_hover={{
						bg: saved ? "yellow.600" : "alpha100"
					}}
				>
					{saved ? "Saved" : "Save"}
				</Button>
			</Flex>

			{tab === "checks" ? (
				<VStack align={"start"} w="100%">
					<Heading as={"h2"} fontSize="lg">
						Last checks
					</Heading>

					<ChecksTable checks={checks} server={server} />
				</VStack>
			) : (
				<Comments comments={comments} setComments={setComments} />
			)}

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
