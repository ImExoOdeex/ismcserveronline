import { Icon } from "@chakra-ui/icons";
import { Button, Flex, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { FiLogOut } from "react-icons/fi/index.js";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import SavedServer from "~/components/layout/dashboard/SavedServer";
import { db } from "~/components/server/db/db.server";
import { getUser, getUserId } from "~/components/server/db/models/user";

export type Guild = {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: number;
	features: string[];
	permissions_new: string;
};

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
					server,
					bedrock,
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
					server,
					bedrock,
					user_id: userId
				}
			});

			invariant(updatedServerId, "Server not found");

			const data = await fetch(`https://api.ismcserver.online/${bedrock ? "bedrock/" : ""}${server}`, {
				headers: {
					Authorization: process.env.API_TOKEN ?? ""
				}
			}).then((res) => res.json());

			await db.savedServer.update({
				where: {
					id: updatedServerId.id
				},
				data: {
					icon: data?.icon || undefined,
					online: data?.online,
					players: data?.players?.online
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
	const user = await getUser(request);

	if (!user) {
		return redirect("/login");
	}

	const servers = await db.savedServer.findMany({
		where: {
			user_id: user.id
		},
		select: {
			id: true,
			bedrock: true,
			server: true,
			icon: true,
			online: true,
			players: true,
			created_at: true
		},
		orderBy: {
			server: "asc"
		}
	});

	return typedjson({ servers });
}

export interface DisplaySavedServer {
	id: number;
	created_at: Date;
	bedrock: boolean;
	server: string;
	online: boolean;
	players: number;
	icon: string | null;
}

export default function Index() {
	const lastServers = useRef({});
	const { servers }: any = useTypedLoaderData<typeof loader>() || { servers: lastServers.current };
	useEffect(() => {
		if (servers) lastServers.current = servers;
	}, [servers]);

	const logoutFetcher = useFetcher();

	return (
		<VStack display={"flex"} w="100%" align={"start"} spacing={4}>
			<VStack align="start">
				<Heading fontSize={"3xl"}>Servers, you have saved for later</Heading>
				<Text>
					Here you can see all servers you have saved for later. You can also add new servers by clicking on the button
					below.
				</Text>
			</VStack>

			{servers.length ? (
				<SimpleGrid w="100%" minChildWidth={{ base: "100%", md: "calc(50% - 20px)" }} spacing={5}>
					{servers.map((server: DisplaySavedServer) => (
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
					<Text fontWeight={600}>You don't have any servers saved for later.</Text>
				</Flex>
			)}

			<logoutFetcher.Form action="/api/auth/logout">
				<Button
					transform={"auto-gpu"}
					_hover={{
						bg: "alpha",
						textDecor: "none"
					}}
					_active={{ scale: 0.9 }}
					type="submit"
					variant={"ghost"}
					color={"red"}
					leftIcon={<Icon as={FiLogOut} />}
					isLoading={logoutFetcher.state !== "idle"}
				>
					Logout
				</Button>
			</logoutFetcher.Form>
		</VStack>
	);
}
