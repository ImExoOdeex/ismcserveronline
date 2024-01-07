import { typedjson } from "remix-typedjson";
import ServerList from "~/components/layout/popularServers/ServerList";
import { db } from "~/components/server/db/db.server";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader() {
	const [servers, count] = await Promise.all([
		db.server.findMany({
			take: 10,
			select: {
				id: true,
				server: true,
				icon: true,
				tags: true
			}
		}),
		db.server.count()
	]);

	return typedjson({ servers, count });
}

export default function Index() {
	const { servers, count } = useAnimationLoaderData<typeof loader>();

	return <ServerList servers={servers} count={count} />;
}
