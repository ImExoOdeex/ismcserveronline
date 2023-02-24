import { VStack } from "@chakra-ui/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import Main from "~/components/layout/popularServers/Main";
import ServerList from "~/components/layout/popularServers/ServerList";
import { db } from "~/components/utils/db.server";

export async function loader() {
	const servers = await db.server.findMany({
		take: 10,
		select: {
			id: true,
			server: true
		}
	});
	const serverCount = await db.server.count();

	return json({ servers, serverCount });
}

export default function PopularServers() {
	const lastServers = useRef({});
	const lastServerCount = useRef({});
	const { servers, serverCount } = useLoaderData<typeof loader>() || {
		servers: lastServers.current,
		serverCount: lastServerCount.current
	};
	useEffect(() => {
		if (servers) lastServers.current = servers;
		if (serverCount) lastServerCount.current = serverCount;
	}, [servers, serverCount]);

	return (
		<VStack
			maxW={"1200px"}
			w="100%"
			align={"start"}
			mx="auto"
			px={4}
			spacing={{ base: 10, md: "125px" }}
			mt={10}
		>
			<Main count={serverCount} />
			<ServerList servers={servers} />
		</VStack>
	);
}
