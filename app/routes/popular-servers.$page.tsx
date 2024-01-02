import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useEffect, useRef } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import ServerList from "~/components/layout/popularServers/ServerList";
import { db } from "~/components/server/db/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
	const page = Number(params.page);
	if (page === 1) {
		throw redirect("/popular-servers");
	}

	const count = await db.server.count();

	const servers = await db.server.findMany({
		take: 10,
		skip: (page - 1) * 10,
		select: {
			id: true,
			server: true,
			icon: true,
			tags: true
		}
	});

	if (!servers.length) {
		const lastPage = Number((count / 10).toFixed(0));
		throw redirect(`/popular-servers/${lastPage}`);
	}

	return typedjson({ servers, page, count });
}

export default function $page() {
	const lastServers = useRef({});
	const lastPage = useRef({});
	const { servers, page, count } = useTypedLoaderData<typeof loader>() || {
		servers: lastServers.current,
		page: lastPage.current
	};
	useEffect(() => {
		if (servers) lastServers.current = servers;
		if (page) lastPage.current = page;
	}, [servers, page]);

	return (
		<>
			<ServerList servers={servers} page={page} count={count} />
		</>
	);
}
