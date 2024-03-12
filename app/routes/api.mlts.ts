import { db } from "@/.server/db/db";
import { csrf } from "@/.server/functions/security.server";
import type { AnyServerModel } from "@/types/minecraftServer";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export interface MLTSServer {
	id: number;
	server: string;
	favicon: string | null;
	players: AnyServerModel["players"];
	description: string | null;
	Tags: {
		name: string;
	}[];
}

// mlts = more like this server
export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);

	try {
		const url = new URL(request.url);
		const playersParam = url.searchParams.get("players");
		const players = typeof playersParam === "string" ? parseInt(playersParam) : 0;
		const bedrock = url.searchParams.get("bedrock") === "";
		const language = url.searchParams.get("language");

		const servers = (await db.server.findMany({
			take: 5,
			where: {
				// it's an object with keys: online, max, list
				players: {
					path: ["online"],
					gte: players
				},
				language,
				bedrock
			},
			select: {
				id: true,
				server: true,
				players: true,
				favicon: true,
				description: true,
				Tags: {
					select: {
						name: true
					}
				}
			}
		})) as MLTSServer[];

		return typedjson({
			success: true,
			servers
		});
	} catch (e) {
		throw typedjson(
			{
				success: false,
				message: (e as Error).message
			},
			{
				status: 500
			}
		);
	}
}
