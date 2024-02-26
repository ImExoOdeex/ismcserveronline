import { db } from "@/.server/db/db";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import ServerList from "@/layout/routes/popularServers/ServerList";
import { typedjson } from "remix-typedjson";

export async function loader() {
	const [servers, count] = await Promise.all([
		db.server.findMany({
			take: 10,
			select: {
				id: true,
				server: true,
				favicon: true
			}
		}),
		db.server.count()
	]);

	return typedjson({ servers, count });
}

export default function Index() {
	const { servers, count } = useAnimationLoaderData<typeof loader>();

	return <ServerList servers={[]} count={count} />;
}
