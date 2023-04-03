import ServerList from "~/components/layout/popularServers/ServerList";
import { db } from "~/components/server/db/db.server";
import { type LoaderArgs, json, redirect } from "@remix-run/node";
import { useRef, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderArgs) {
	const page = Number(params.page);
	if (page === 1) {
		return redirect("/popular-servers");
	}

	const count = await db.server.count();

	const servers = await db.server
		.findMany({
			take: 10,
			skip: (page - 1) * 10,
			select: {
				id: true,
				server: true,
				icon: true,
				tags: true
			}
		})
		.catch(() => null);

	// @ts-ignore
	if (!servers?.length) {
		const lastPage = Number((count / 10).toFixed(0));
		return redirect(`/popular-servers/${lastPage}`);
	}

	return json({ servers, page, count });
}

export default function $page() {
	const lastServers = useRef({});
	const lastPage = useRef({});
	const { servers, page, count } = useLoaderData<typeof loader>() || {
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
