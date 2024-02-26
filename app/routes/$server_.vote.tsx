import { db } from "@/.server/db/db";
import { getUser, getUserId } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import { getRandomMinecarftImage } from "@/.server/minecraftImages";
import { emitter } from "@/.server/sse/emitter";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import ServerView from "@/layout/routes/server/index/ServerView";
import LoginToVote from "@/layout/routes/server/vote/LoginToVote";
import MessageFromOwner from "@/layout/routes/server/vote/MessageFromOwner";
import Vote from "@/layout/routes/server/vote/Vote";
import { AnyServer, AnyServerModel } from "@/types/minecraftServer";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Divider, Flex, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { UseDataFunctionReturn, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
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

	const image = getRandomMinecarftImage();

	return typedjson(
		{
			data: foundServer,
			vote,
			image
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
	const { data, image } = useAnimationLoaderData<typeof loader>();
	const user = useUser();

	return (
		<VStack spacing={"40px"} align="start" maxW="1000px" mx="auto" w="100%" mt={"50px"} px={4} mb={5}>
			{/* <Ad type={adType.small} width={"968px"} /> */}

			<Button leftIcon={<ArrowBackIcon />} as={Link} to={`/${data.bedrock ? "bedrock/" : ""}${data.server}`}>
				Go back
			</Button>
			<Flex w="100%" flexDir={"column"} gap={2}>
				<ServerView
					server={data.server}
					data={data as unknown as AnyServer}
					verified={!!data.owner_id}
					bedrock={data.bedrock}
					image={image}
					mb={20}
				/>
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
