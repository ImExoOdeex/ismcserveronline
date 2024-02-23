import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Divider, Flex, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { UseDataFunctionReturn, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import { Ad, adType } from "~/components/ads/Yes";
import LoginToVote from "~/components/layout/server/vote/LoginToVote";
import MessageFromOwner from "~/components/layout/server/vote/MessageFromOwner";
import ServerVoteView from "~/components/layout/server/vote/ServerVoteView";
import Vote from "~/components/layout/server/vote/Vote";
import { db } from "~/components/server/db/db.server";
import { getUser, getUserId } from "~/components/server/db/models/user";
import { cachePrefetch } from "~/components/server/functions/fetchHelpers.server";
import { csrf } from "~/components/server/functions/security.server";
import { emitter } from "~/components/server/sse/emitter.server";
import { AnyServerModel } from "~/components/types/minecraftServer";
import Link from "~/components/utils/Link";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";
import useUser from "~/components/utils/hooks/useUser";
import { InsideErrorBoundary } from "~/document";

const votingHours = 12;
const votingCooldown = votingHours * 60 * 60 * 1000; // 12 hours in milliseconds

export async function action({ request, params }: ActionFunctionArgs) {
	csrf(request);

	try {
		const user = await getUser(request);
		invariant(user, "You must be logged in to vote");

		const form = await request.formData();
		const nick = form.get("nick")?.toString().trim() as string;
		invariant(nick, "You must provide a Minecraft nickname");

		const server = params.server?.toString().toLowerCase();
		const url = new URL(request.url);
		const isBedrock = url.pathname.split("/").length === 2 && url.pathname.split("/")[0] === "bedrock";

		const foundServer = await db.server.findFirst({
			where: {
				server,
				bedrock: isBedrock
			}
		});
		invariant(foundServer, "Server not found");

		// check if this user has already voted
		const userVote = await db.vote.findFirst({
			where: {
				server_id: foundServer.id,
				user_id: user.id,
				created_at: {
					gte: new Date(Date.now() - votingCooldown)
				}
			}
		});
		invariant(!userVote, "You have already voted for this server");

		// check if this nickname has already voted
		const nickVote = await db.vote.findFirst({
			where: {
				server_id: foundServer.id,
				nick,
				created_at: {
					gte: new Date(Date.now() - votingCooldown)
				}
			}
		});
		invariant(!nickVote, "This nickname has already voted");

		const vote = await db.vote.create({
			data: {
				server_id: foundServer.id,
				user_id: user.id,
				nick
			}
		});

		emitter.emit(`vote-${foundServer.id}`, {
			id: vote.id,
			nick
		});

		return typedjson(
			{
				success: true,
				vote
			},
			{
				headers: {
					"Set-Cookie": `last-minecraft-nickname=${nick}; Path=/; Max-Age=${
						60 * 60 * 24 * 365
					}; SameSite=Strict; HttpOnly; Secure`
				}
			}
		);
	} catch (e) {
		return typedjson({
			success: false,
			message: (e as Error).message
		});
	}
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const server = params.server?.toString().toLowerCase();
	if (!server?.includes("."))
		throw new Response("Not found", {
			status: 404
		});

	const url = new URL(request.url);
	const pathStrArr = url.pathname.split("/");
	const bedrock = pathStrArr.length === 2 && pathStrArr[0] === "bedrock";

	const foundServer = (await db.server
		.findFirst({
			where: {
				server,
				bedrock
			}
		})
		.catch(() => null)) as unknown as AnyServerModel | null;

	if (!foundServer) {
		throw new Response("Not found", {
			status: 404
		});
	}

	const userId = await getUserId(request);
	// vote in last 12 hours
	const vote = userId
		? await db.vote.findFirst({
				where: {
					server_id: foundServer.id,
					user_id: userId,
					created_at: {
						gte: new Date(Date.now() - votingCooldown)
					}
				}
		  })
		: null;

	return typedjson(
		{
			data: foundServer,
			vote
		},
		cachePrefetch(request)
	);
}

export function meta({ data, matches }: MetaArgs) {
	return [
		{
			title: data
				? "Vote for " + (data as UseDataFunctionReturn<typeof loader>).data.server + "! | IsMcServer.online"
				: "Server not found | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export function shouldRevalidate() {
	return false;
}

export default function ServerVote() {
	const { data } = useAnimationLoaderData<typeof loader>();
	const user = useUser();

	return (
		<VStack spacing={"40px"} align="start" maxW="1000px" mx="auto" w="100%" mt={"50px"} px={4} mb={5}>
			<Ad type={adType.small} width={"968px"} />

			<Button leftIcon={<ArrowBackIcon />} as={Link} to={`/${data.bedrock ? "bedrock/" : ""}${data.server}`}>
				Go back
			</Button>
			<Flex w="100%" flexDir={"column"} gap={2}>
				<ServerVoteView server={data.server} data={data} bedrock={data.bedrock} />
			</Flex>

			{user ? <Vote /> : <LoginToVote />}

			<Divider />

			<MessageFromOwner
				message={data?.message_from_owner}
				ownerId={data?.owner_id}
				server={data.server}
				bedrock={data.bedrock}
			/>
		</VStack>
	);
}

export function ErrorBoundary() {
	return (
		<Flex flex={1} alignItems={"center"} justifyContent={"center"}>
			<InsideErrorBoundary />
		</Flex>
	);
}
