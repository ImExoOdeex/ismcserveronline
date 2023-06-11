import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import ServerList from "~/components/layout/popularServers/ServerList";
import { db } from "~/components/server/db/db.server";

export async function loader() {
	const servers = await db.server.findMany({
		take: 10,
		select: {
			id: true,
			server: true,
			icon: true,
			tags: true
		}
	});
	const count = await db.server.count();

	return json({ servers, count });
}
export default function Index() {
	const lastServers = useRef({});
	const { servers, count } = useLoaderData<typeof loader>() || {
		servers: lastServers.current
	};
	useEffect(() => {
		if (servers) lastServers.current = servers;
	}, [servers]);

	return <ServerList servers={servers} count={count} />;
}
