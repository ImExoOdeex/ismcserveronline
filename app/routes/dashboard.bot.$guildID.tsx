import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import BotNotOnServer from "@/layout/routes/dashboard/bot/BotNotOnServer";
import { Button, Flex, HStack, Heading, Image, Stack } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLocation, useOutlet } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import { InsideErrorBoundary } from "~/document";
import { Guild } from "./dashboard.bot._index";

export const handle = {
	showSidebar: false
};

export async function loader({ params, request }: LoaderFunctionArgs) {
	csrf(request);
	const guildID = params.guildID!;
	const userGuilds = await getUser(request, {
		guilds: true
	}).then((user) => {
		if (!user) {
			throw redirect("/relog");
		}
		return user.guilds as unknown as Guild[];
	});

	if (!userGuilds) throw redirect("/dashboard");

	await requireUserGuild(request, guildID, userGuilds);

	const guild = await fetch(`${serverConfig.botApi}/${guildID}/guild`, {
		method: "GET",
		headers: {
			Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
		}
	}).then((res) => res.json());

	const userContainsGuild = guild ? (userGuilds.find((g) => g.id === guild.id) ? true : false) : false;

	return typedjson({ guild: userContainsGuild ? guild : null });
}

export default function $guildID() {
	const { guild } = useAnimationLoaderData<typeof loader>();

	const outlet = useOutlet();
	const { pathname } = useLocation();

	if (!guild) {
		return <BotNotOnServer />;
	}

	const links = [
		{
			name: "Livecheck",
			path: `/dashboard/bot/${guild.id}`
		},
		{
			name: "Config",
			path: `/dashboard/bot/${guild.id}/config`
		},
		{
			name: "Editor",
			path: `/dashboard/bot/${guild.id}/editor`
		}
	];

	return (
		<>
			<Stack direction={{ base: "column", md: "row" }} spacing={10}>
				<HStack spacing={5}>
					<Image
						rounded={"full"}
						src={
							guild?.icon
								? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=256`
								: "/discordLogo.png"
						}
						alt={guild.name + "'s icon"}
						boxSize={16}
					/>
					<Heading>{guild.name}</Heading>
				</HStack>

				<HStack>
					{links.map((link) => (
						<Button key={link.name} as={Link} variant={pathname === link.path ? "brand" : "ghost"} to={link.path}>
							{link.name}
						</Button>
					))}
				</HStack>
			</Stack>
			{outlet}
		</>
	);
}

export function ErrorBoundary() {
	return (
		<Flex mt={20} mx={"auto"}>
			<InsideErrorBoundary />
		</Flex>
	);
}
