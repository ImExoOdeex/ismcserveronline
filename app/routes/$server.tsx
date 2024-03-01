import { authenticator } from "@/.server/auth/authenticator";
import { Info, sendCommentWebhook, sendDeleteCommentWebhook, sendReportWebhook } from "@/.server/auth/webhooks";
import { db } from "@/.server/db/db";
import { getUser, getUserId } from "@/.server/db/models/user";
import { getServerInfo } from "@/.server/functions/api.server";
import { requireEnv } from "@/.server/functions/env.server";
import { MinecraftImage, getRandomMinecarftImage } from "@/.server/minecraftImages";
import { getCookieWithoutDocument } from "@/functions/cookies";
import { getFullFileUrl } from "@/functions/storage";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useEventSourceCallback from "@/hooks/useEventSourceCallback";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import { Ad, adType } from "@/layout/global/ads/Yes";
import ChecksTable from "@/layout/routes/server/index/ChecksTable";
import Comments from "@/layout/routes/server/index/Comments";
import CommentsSkeleton from "@/layout/routes/server/index/CommentsSkeleton";
import McFonts from "@/layout/routes/server/index/McFonts";
import Motd from "@/layout/routes/server/index/Motd";
import ServerInfo from "@/layout/routes/server/index/ServerInfo";
import ServerView from "@/layout/routes/server/index/ServerView";
import Tabs, { tabs } from "@/layout/routes/server/index/Tabs";
import UnderServerView from "@/layout/routes/server/index/UnderServerView";
import { AnyServer, AnyServerModel, BedrockServer, JavaServer, MinecraftServer } from "@/types/minecraftServer";
import { Divider, Flex, HStack, Heading, Icon, Stack, Text, VStack, VisuallyHidden, useToast } from "@chakra-ui/react";
import { Prisma } from "@prisma/client";
import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Await, type ShouldRevalidateFunction } from "@remix-run/react";
import dayjs from "dayjs";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BiBug, BiInfoCircle } from "react-icons/bi";
import { typeddefer, typedjson } from "remix-typedjson";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { InsideErrorBoundary } from "~/document";

export function links() {
	return [
		{
			rel: "preload",
			href: "/Minecraft.otf",
			as: "font",
			type: "font/otf",
			crossOrigin: "anonymous"
		}
	] as ReturnType<LinksFunction>;
}

export async function action({ request, params }: ActionFunctionArgs) {
	const form = await request.formData();
	const action = form.get("action");

	switch (action) {
		case "query":
			throw redirect(`?query`);
		case "comment": {
			const content = form.get("content")?.toString();
			const server = params.server!.toString().toLowerCase();

			const serverId = (await db.server.findFirst({
				where: {
					server: server,
					bedrock: false
				}
			}))!.id;

			const user = await getUser(request, {
				nick: true,
				photo: true,
				id: true,
				email: true
			});
			if (!user) throw new Error("User is not logged!");

			try {
				if (!content) throw new Error("Content is not definied!");
				if (content.trim().length < 5) throw new Error("Content is too short!");
				if (content.trim().length > 250) throw new Error("Content is too long!");

				const hasCommented = await db.comment.findFirst({
					where: {
						user_id: user.id,
						server_id: serverId
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
					server_id: serverId,
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

			const serverId = (await db.server.findFirst({
				where: {
					server: server,
					bedrock: false
				}
			}))!.id;

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
						server_id: serverId
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

			const serverId = (await db.server.findFirst({
				where: {
					server: server,
					bedrock: false
				}
			}))!.id;

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				if (!id) throw new Error("ID is not definied!");

				const comment = await db.comment.findFirst({
					where: {
						id: Number(id),
						server_id: serverId
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

			const serverId = (await db.server.findFirst({
				where: {
					server: server,
					bedrock: false
				}
			}))!.id;

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				if (!id) throw new Error("ID is not definied!");

				const comment = await db.comment.findFirst({
					where: {
						id: Number(id),
						server_id: serverId
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

			const serverId = (await db.server.findFirst({
				where: {
					server: server,
					bedrock: false
				}
			}))!.id;

			const user = await getUser(request);
			if (!user) throw new Error("User is not logged!");

			try {
				const hasSaved = await db.savedServer.findFirst({
					where: {
						user_id: user.id,
						server_id: serverId
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
							server_id: serverId,
							user_id: user.id
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
	const pathStrArr = url.pathname.split("/");
	const bedrock = pathStrArr.length === 2 && pathStrArr[0] === "bedrock";

	let foundServer = (await db.server
		.findFirst({
			where: {
				server,
				bedrock
			},
			select: {
				id: true,
				server: true,
				bedrock: true,
				online: true,
				players: true,
				host: true,
				port: true,
				protocol: true,
				motd: true,
				version: true,
				banner: true,
				background: true,
				Tags: true,
				software: true,
				favicon: true,
				ping: true,
				edition: true,
				gamemode: true,
				guid: true,
				ip: true,
				plugins: true,
				owner_id: true,
				map: true
			}
		})
		.catch(() => null)) as unknown as AnyServerModel | null;

	let data = !foundServer
		? await getServerInfo(server, query, bedrock)
		: getServerInfo(server, query, bedrock).then(async (res) => {
				// using Prisma.DbNull, to null out JSON fields, since null is not allowed in JSON fields.
				console.log("PROMISE GET SERVER INOF EHHEHE");

				await db.server.update({
					where: {
						id: foundServer!.id
					},
					data: {
						online: res.online,
						players: res.players,
						motd: res.motd,
						version: res.version ?? undefined,
						software: bedrock ? null : (res as JavaServer).software,
						protocol: res.protocol,
						host: res.host,
						port: bedrock ? (res as BedrockServer).port.ipv4 : (res as JavaServer).port,

						// java only
						favicon: bedrock ? null : (res as JavaServer).favicon,
						ping: bedrock ? null : (res as MinecraftServer).ping,

						// bedrock stuff
						edition: bedrock ? (res as BedrockServer).edition : null,
						gamemode: bedrock ? (res as BedrockServer).gamemode : Prisma.DbNull,
						guid: bedrock ? (res as BedrockServer).guid : null,

						// query stuff
						ip: query ? (res as MinecraftServer).ip : null,
						plugins: query ? (res as MinecraftServer).plugins : Prisma.DbNull,
						map: query ? (res as MinecraftServer).map : null
					}
				});

				if (!blockTracking && data) {
					const IP = getClientIPAddress(request.headers);

					const token_id = (
						await db.token.findUnique({
							where: {
								token: requireEnv("API_TOKEN")
							}
						})
					)?.id;
					if (!token_id) throw new Error("There's no valid API token!");

					await db.check.create({
						data: {
							server_id: serverId,
							online: res.online,
							players: res.players.online,
							source: "WEB",
							client_ip: IP,
							token_id: token_id
						}
					});
				}

				return res;
		  });

	const cookie = getCookieWithoutDocument("tracking", request.headers.get("cookie") ?? "");
	const blockTracking = cookie == "no-track" ? true : false;

	if (!foundServer) {
		data = data as AnyServer;
		foundServer = (await db.server.create({
			data: {
				server,
				bedrock: false,

				online: data.online,
				players: data.players,
				host: data.host,
				port: bedrock ? (data as BedrockServer).port.ipv4 : (data as JavaServer).port,
				protocol: data.protocol,
				motd: data.motd,
				version: data.version || Prisma.DbNull,
				software: bedrock ? null : (data as JavaServer).software,

				// java only
				favicon: bedrock ? null : (data as JavaServer).favicon,
				ping: bedrock ? null : (data as MinecraftServer).ping,

				// bedrock stuff
				edition: bedrock ? (data as BedrockServer).edition : null,
				gamemode: bedrock ? (data as BedrockServer).gamemode : Prisma.DbNull,
				guid: bedrock ? (data as BedrockServer).guid : null,

				// query stuff
				ip: query ? (data as MinecraftServer).ip : null,
				plugins: query ? (data as MinecraftServer).plugins : Prisma.DbNull,
				map: query ? (data as MinecraftServer).map : null
			}
		})) as unknown as AnyServerModel;
	}

	const serverId = foundServer.id;

	const isAuth = await authenticator.isAuthenticated(request);
	const [votes, checks, isSaved] = await Promise.all([
		db.vote.count({
			where: {
				server_id: serverId,
				created_at: {
					gte: dayjs().startOf("month").toDate()
				}
			}
		}),
		db.check.findMany({
			where: {
				server_id: serverId
			},
			select: {
				id: true,
				online: true,
				players: true,
				source: true,
				Server: {
					select: {
						server: true,
						bedrock: true
					}
				},
				checked_at: true
			},
			orderBy: {
				id: "desc"
			},
			take: 20,
			skip: Number(c) || 0
		}),
		isAuth
			? db.savedServer
					.findFirst({
						where: {
							server_id: serverId,
							user_id: (await getUserId(request))!
						}
					})
					.then((s) => (s ? true : false))
			: false
	]);

	const image = foundServer.banner
		? ({
				name: "Server banner",
				url: getFullFileUrl(foundServer.banner, "banner"),
				credits: ""
		  } as MinecraftImage)
		: getRandomMinecarftImage();

	return typeddefer({ server, data, checks, query, isSaved, foundServer, bedrock, serverId, image, votes });
}

export function meta({ data, matches }: MetaArgs) {
	return [
		{
			title: data ? (data as any).server + "'s status | IsMcServer.online" : "Server not found | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formData, currentParams, nextParams }) => {
	if (currentParams.server !== nextParams.server) return true;
	if (!formData) return false;
	if (formData.get("action") === "query") return true;

	return false;
};

export default function $server() {
	const {
		server,
		checks,
		image,
		query,
		isSaved,
		bedrock,
		serverId,
		votes: dbVotes,
		data: promiseData, // data is there promise data, cause it's streaming, so "foundServer" is a data rn.
		foundServer: data
	} = useAnimationLoaderData<typeof loader>();

	const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("checks");
	const [comments, setComments] = useState<any[] | null>(null);

	const [votes, setVotes] = useState<number>(dbVotes);
	const toast = useToast();
	useEventSourceCallback(
		`/api/sse/vote?id=${serverId}`,
		{
			event: "new-vote"
		},
		(sourceData) => {
			toast({
				description: `${sourceData.nick} has voted for ${data.server}!`,
				status: "info",
				duration: 5000,
				containerStyle: {
					fontWeight: 500
				},
				isClosable: false,
				variant: "subtle"
			});

			setVotes((v) => v + 1);
		}
	);

	const user = useUser();
	const isOwner = useMemo(() => {
		if (!user) return false;
		if (!data?.owner_id) return false;
		return user.id === data.owner_id;
	}, [data]);

	const [shouldPregenerateStyles, setShouldPregenerateStyles] = useState(true);
	useEffect(() => {
		setShouldPregenerateStyles(false);
	}, [server]);

	return (
		<Flex gap={5} flexDir={"column"} maxW="1000px" mx="auto" w="100%" mt={"50px"} px={4} mb={5}>
			{/* <Ad type={adType.small} width={"968px"} /> */}

			{shouldPregenerateStyles && (
				<VisuallyHidden>
					{/* pregenerate styles, cause emotion sucks */}
					<ServerView
						verified={!!data.owner_id}
						server={server}
						data={data as unknown as AnyServer}
						bedrock={bedrock}
						image={image}
						mb={28}
					/>
					<Motd motd={data?.motd.html} />
				</VisuallyHidden>
			)}

			<Flex w="100%" flexDir={"column"} gap={2}>
				<Suspense
					fallback={
						<ServerView
							verified={!!data.owner_id}
							server={server}
							data={data as unknown as AnyServer}
							bedrock={bedrock}
							image={image}
							mb={28}
						/>
					}
				>
					<Await resolve={promiseData}>
						{(freshData) => (
							<ServerView
								verified={!!data.owner_id}
								server={server}
								data={freshData}
								bedrock={bedrock}
								image={image}
								mb={28}
							/>
						)}
					</Await>
				</Suspense>

				{/* displaying motd */}
				<McFonts />

				<Suspense fallback={data.online ? <Motd motd={data?.motd.html} /> : <></>}>
					<Await resolve={promiseData}>{(freshData) => <Motd motd={freshData.motd.html} />}</Await>
				</Suspense>
			</Flex>

			<Divider />

			<UnderServerView
				voteCount={votes}
				server={server}
				bedrock={bedrock}
				promiseData={promiseData instanceof Promise ? promiseData : Promise.resolve(promiseData)}
				isOwner={isOwner}
			/>

			{/* I copy the component with non display, to generate the emotion styles, that would be used in streamed content, that emotion wouldn't generate */}
			<VisuallyHidden>
				<ServerInfo bedrock={bedrock} data={data} query={query} server={server} />
			</VisuallyHidden>

			<Suspense fallback={<ServerInfo server={server} data={data} bedrock={bedrock} query={query} />}>
				<Await resolve={promiseData}>
					{(freshData) => <ServerInfo server={server} data={freshData} bedrock={bedrock} query={query} />}
				</Await>
			</Suspense>

			<Divider />

			<Tabs
				tab={tab}
				setTab={setTab}
				isSaved={isSaved}
				// counts={{
				// checks: data._count?.Check,
				// comments: data?._count?.Comment
				// }}
			/>

			{tab === "checks" && (
				<VStack align={"start"} w="100%">
					<Heading as={"h2"} fontSize="lg">
						Last checks
					</Heading>

					<ChecksTable checks={checks} server={server} serverId={serverId} />
				</VStack>
			)}
			{tab === "comments" && (
				<>
					{comments !== null && <Comments comments={comments} setComments={setComments} />}
					{comments === null && <CommentsSkeleton serverId={serverId} comments={comments} setComments={setComments} />}
				</>
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
		</Flex>
	);
}

export function ErrorBoundary() {
	return (
		<Flex flex={1} alignItems={"center"} justifyContent={"center"}>
			<InsideErrorBoundary />
		</Flex>
	);
}
