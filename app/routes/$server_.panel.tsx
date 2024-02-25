import { Flex, Heading } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import Sidebar from "~/components/layout/server/panel/Sidebar";
import { db } from "~/components/server/db/db.server";
import { getUser } from "~/components/server/db/models/user";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await getUser(request);
	invariant(user, "User is not logged in");

	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[0] === "bedrock";
	const server = await db.server.findFirst({
		where: {
			server: params.server?.toLowerCase(),
			bedrock
		},
		select: {
			owner_id: true,
			id: true,
			server: true,
			bedrock: true,
			favicon: true,
			message_from_owner: true,
			online: true,
			players: true
		}
	});
	if (!server) throw new Response("Server not found", { status: 404 });
	if (!server.owner_id) throw new Response("Server not verified", { status: 404 });

	return typedjson({
		server
	});
}

export default function ServerPanel() {
	const { server } = useAnimationLoaderData<typeof loader>();

	return (
		<Flex flexDir={"column"} w="100%" gap={10} maxW={"1200px"} mx="auto" px={4} mt={5}>
			<Heading fontSize={"2xl"}>{server.server}'s Panel</Heading>

			<Flex gap={10} w="100%">
				<Sidebar server={server.server} bedrock={server.bedrock} />
				<Outlet />
			</Flex>
		</Flex>
	);
}
