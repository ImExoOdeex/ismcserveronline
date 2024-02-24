import { Heading } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, typedjson } from "remix-typedjson";
import { db } from "~/components/server/db/db.server";
import { getUser } from "~/components/server/db/models/user";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

// wip
export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await getUser(request);
	if (!user) throw redirect("/login");

	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[0] === "bedrock";

	const server = await db.server.findFirst({
		where: {
			server: params.server,
			bedrock
		},
		select: {
			owner_id: true,
			id: true,
			server: true,
			bedrock: true
		}
	});

	if (!server) throw new Response("Server not found", { status: 404 });

	const isVerified = server.owner_id;

	return typedjson({
		isVerified,
		server
	});
}

// wip
export default function $serverVerify() {
	const { server, isVerified } = useAnimationLoaderData<typeof loader>();

	return (
		<>
			<Heading fontSize={["2xl", "3xl", "4xl", "5xl"]} fontWeight="bold" textAlign="center" mb={4}>
				{server.server}
			</Heading>
		</>
	);
}
