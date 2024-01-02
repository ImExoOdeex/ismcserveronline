import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { getUser } from "~/components/server/db/models/user";
import { getCounts, getStats } from "~/components/server/functions/admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUser(request);

	if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

	const counts = await getCounts();
	const stats = await getStats();

	return typedjson({
		counts,
		stats
	});
}

export default function DashboardAdmin() {
	return <div></div>;
}
