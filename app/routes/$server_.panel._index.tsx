import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Image, Text } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";
import { typeddefer } from "remix-typedjson";
import invariant from "tiny-invariant";
import DragAndDropFile from "~/components/layout/server/panel/DragAndDropFile";
import { db } from "~/components/server/db/db.server";
import { getUser } from "~/components/server/db/models/user";
import { ServerModel } from "~/components/types/minecraftServer";
import { getFullFileUrl } from "~/components/utils/functions/storage";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await getUser(request);
	invariant(user, "User is not logged in");

	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[0] === "bedrock";
	const server = await db.server.findFirst({
		where: {
			server: params.server?.toLowerCase(),
			bedrock
		},
		select: {
			id: true,
			server: true,
			bedrock: true,
			online: true,
			players: true,
			owner_id: true,
			banner: true,
			background: true
		}
	});
	if (!server) throw new Response("Server not found", { status: 404 });
	if (!server.owner_id) throw new Response("Server not verified", { status: 404 });

	const votes = db.vote.count({
		where: {
			server_id: server.id,
			created_at: {
				gte: dayjs().startOf("month").toDate()
			}
		}
	});
	const votesInThisMonth = db.vote.findMany({
		where: {
			server_id: server.id,
			created_at: {
				gte: dayjs().startOf("month").toDate()
			}
		}
	});
	const checks = db.check.count({
		where: {
			server_id: server.id
		}
	});
	const checksInThisMonth = db.check.findMany({
		where: {
			server_id: server.id,
			checked_at: {
				gte: dayjs().startOf("month").toDate()
			}
		}
	});
	const comments = db.comment.count({
		where: {
			server_id: server.id
		}
	});

	return typeddefer({
		server,
		votes,
		votesInThisMonth,
		checks,
		checksInThisMonth,
		comments
	});
}

export default function ServerPanel() {
	const { server } = useAnimationLoaderData<typeof loader>();

	return (
		<Flex gap={4} w="100%" flexDir={"column"}>
			<Flex flexDir={"column"} gap={4} w={"100%"}>
				<Text fontSize={"2xl"} fontWeight={600}>
					Server Information
				</Text>

				<Flex gap={2} flexDir={{ base: "column", md: "row" }}>
					<Flex p={4} rounded="xl" border="1px solid" borderColor={"alpha300"} flexDir={"column"} w="100%" gap={2}>
						<Text fontWeight={600} fontSize={"lg"}>
							Server Status
						</Text>

						<Text color={server.online ? "green" : "red"} fontSize={"2xl"} fontWeight={600}>
							{server.online ? "Online" : "Offline"}
						</Text>
					</Flex>

					<Flex p={4} rounded="xl" border="1px solid" borderColor={"alpha300"} flexDir={"column"} w="100%" gap={2}>
						<Text fontWeight={600} fontSize={"lg"}>
							Current Players
						</Text>

						<Text color={"textSec"} fontSize={"2xl"} fontWeight={600}>
							{(server.players as any as ServerModel.Players<any>).online}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex flexDir={"column"} gap={2}>
				<Flex w="100%" alignItems={"center"} gap={4} justifyContent={"space-between"}>
					<Flex flexDir={"column"}>
						<Text fontSize={"lg"} fontWeight={600}>
							Banner
						</Text>
						<Text color={"textSec"}>Upload a banner for your server. It will be displayed on the server's page.</Text>
					</Flex>

					{/* TODO: do alert dialog for that to show template */}
					<IconButton aria-label="Info" icon={<InfoOutlineIcon />} variant={"ghost"} />
				</Flex>

				{server.banner && <Image src={getFullFileUrl(server.banner)} alt={`${server.server}'s banner`} w="100%" />}
				{!server.banner && <DragAndDropFile />}
			</Flex>

			<Flex flexDir={"column"} gap={2}>
				<Flex w="100%" alignItems={"center"} gap={4} justifyContent={"space-between"}>
					<Flex flexDir={"column"}>
						<Text fontSize={"lg"} fontWeight={600}>
							Background
						</Text>
						<Text color={"textSec"}>
							Upload own background for your server. It will be displayed in the Background.
						</Text>
					</Flex>

					{/* TODO: do alert dialog for that to show template */}
					<IconButton aria-label="Info" icon={<InfoOutlineIcon />} variant={"ghost"} />
				</Flex>

				{server.banner && <Image src={getFullFileUrl(server.banner)} alt={`${server.server}'s banner`} w="100%" />}
				{!server.banner && <DragAndDropFile />}
			</Flex>
		</Flex>
	);
}
