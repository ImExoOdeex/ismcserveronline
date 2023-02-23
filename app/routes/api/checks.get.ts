import { type LoaderArgs, json } from "@remix-run/node";
import { db } from "~/components/utils/db.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  const server = url.searchParams.get("server");
  if (!server) {
    return "no server given!";
  }
  const c = url.searchParams.get("c") || 0;

  const checks = await db.check.findMany({
    where: {
      server: {
        contains: server,
      },
      bedrock: false,
    },
    select: {
      id: true,
      server: false,
      online: true,
      players: true,
      source: true,
      checked_at: true,
    },
    orderBy: {
      id: "desc",
    },
    take: 20,
    skip: Number(c) ?? 0,
  });

  return json({ checks });
}
