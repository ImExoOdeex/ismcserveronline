import { db } from "@/.server/db/db";
import { getUserId } from "@/.server/db/models/user";
import { getServerInfo } from "@/.server/functions/api.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import SavedServer from "@/layout/routes/dashboard/SavedServer";
import { ServerModel } from "@/types/minecraftServer";
import { Flex, Heading, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Await } from "@remix-run/react";
import { Suspense, memo, useEffect, useRef } from "react";
import { typeddefer, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export interface Guild {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: number;
	features: string[];
	permissions_new: string;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const action = formData.get("action")?.toString() as string;

	switch (action) {
		case "delete": {
			const server = formData.get("server")?.toString() as string;
			const bedrock = formData.get("bedrock")?.toString() === "true";

			const userId = await getUserId(request);
			invariant(userId, "User is not logged in");

			const serverId = await db.savedServer.findFirst({
				where: {
					Server: {
						server,
						bedrock
					},
					user_id: userId
				}
			});

			invariant(serverId, "Server not found");

			await db.savedServer.delete({
				where: {
					id: serverId.id
				}
			});

			return typedjson({
				success: true
			});
		}
		case "refresh": {
			const server = formData.get("server")?.toString() as string;
			const bedrock = formData.get("bedrock")?.toString() === "true";
			const userId = await getUserId(request);
			invariant(userId, "User is not logged in");

			const updatedServerId = await db.savedServer.findFirst({
				where: {
					Server: {
						server,
						bedrock
					},
					user_id: userId
				}
			});

			invariant(updatedServerId, "Server not found");

			const data = await getServerInfo(server, bedrock);

			await db.server.update({
				where: {
					id: updatedServerId.server_id
				},
				data: {
					online: data.online,
					players: data.players
				}
			});

			return typedjson({
				success: true
			});
		}
		case "go": {
			const server = formData.get("server")?.toString() as string;
			const bedrock = formData.get("bedrock")?.toString() === "true";

			return redirect(`/${bedrock ? "bedrock/" : ""}${server}`);
		}
		default: {
			throw new Error("Invalid action");
		}
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await getUserId(request);

	if (!userId) {
		throw redirect("/login");
	}

	const servers = new Promise((r) => {
		r(
			db.savedServer.findMany({
				where: {
					user_id: userId
				},
				select: {
					id: true,
					Server: {
						select: {
							bedrock: true,
							server: true,
							favicon: true,
							online: true,
							players: true
						}
					},
					created_at: true
				},
				orderBy: {
					Server: {
						server: "asc"
					}
				}
			})
		);
	}) as unknown as Promise<DisplaySavedServer[]>;

	return typeddefer({ servers });
}

export interface DisplaySavedServer {
	id: number;
	Server: {
		bedrock: boolean;
		server: string;
		favicon: string | null;
		online: boolean;
		players: ServerModel.Players<false>;
	};
	created_at: Date;
}

export default function Index() {
	const { servers: deferredServers } = useAnimationLoaderData<typeof loader>();

	const init = useRef(true);

	useEffect(() => {
		if (init.current) {
			console.log("INITTTTT EFFFECTTT");
			init.current = false;
		}

		console.log({
			deferredServers
		});
	}, [deferredServers]);

	return (
		<VStack display={"flex"} w="100%" align={"start"} spacing={4}>
			<VStack align="start">
				<Heading fontSize={"2xl"}>Servers, you have bookmarked</Heading>
				<Text>
					Here you can see all servers you have saved for later. You can bookmark a server by clicking "Bookmark" on a
					server's page.
				</Text>
			</VStack>
			<Suspense
				fallback={
					<Flex w="100%" p={5} alignItems={"center"} justifyContent={"center"}>
						<Spinner size="lg" speed="0.4s" />
					</Flex>
				}
			>
				<Await resolve={deferredServers}>{(servers) => <MemoServersDisplay servers={servers} />}</Await>
			</Suspense>
			;
		</VStack>
	);
}

function ServersDisplay({ servers }: { servers: DisplaySavedServer[] }) {
	return (
		<>
			{servers.length ? (
				<SimpleGrid w="100%" minChildWidth={{ base: "100%", md: "calc(50% - 20px)" }} spacing={5}>
					{servers.map((server) => (
						<SavedServer key={server.id} server={server} />
					))}
				</SimpleGrid>
			) : (
				<Flex
					bg="alpha"
					rounded={"xl"}
					w="100%"
					maxW="600px"
					p={5}
					mx="auto"
					alignSelf={"center"}
					alignItems={"center"}
					justifyContent="center"
				>
					<Text fontWeight={600}>You don't have any servers bookmarked.</Text>
				</Flex>
			)}
		</>
	);
}

const MemoServersDisplay = memo(ServersDisplay);
