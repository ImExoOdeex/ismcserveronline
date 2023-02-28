import { type LoaderArgs, json } from "@remix-run/node";
import { db } from "~/components/utils/db.server";

export async function loader({ params }: LoaderArgs) {
	const server = params.server;

	const letters = server?.split("");

	const complete = await db.server.findMany({
		where: {
			AND: letters?.map((l) => {
				return {
					server: {
						contains: l
					}
				};
			})
		},
		orderBy: {
			id: "asc"
		},
		select: {
			id: true,
			server: true,
			icon: true
		},
		take: 5
	});

	return json({ complete });
}
