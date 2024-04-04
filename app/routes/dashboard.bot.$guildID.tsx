import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { requireUserGuild } from "@/.server/functions/secureDashboard.server";
import { csrf } from "@/.server/functions/security.server";
import serverConfig from "@/.server/serverConfig";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import BotNotOnServer from "@/layout/routes/dashboard/bot/BotNotOnServer";
import config from "@/utils/config";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Flex, HStack, Heading, Image, Stack } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLocation, useOutlet } from "@remix-run/react";
import type { Transition } from "framer-motion";
import { motion } from "framer-motion";
import { typedjson } from "remix-typedjson";
import { InsideErrorBoundary } from "~/document";
import type { Guild } from "./dashboard.bot._index";

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
	})
		.then((res) => res.json())
		.catch(() => null);
	if (!guild) {
		throw new Response("Not found", {
			status: 404
		});
	}

	const userContainsGuild = guild ? (userGuilds.find((g) => g.id === guild.id) ? true : false) : false;

	return typedjson({ guild: userContainsGuild ? guild : null });
}

// WIP
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
		// {
		// 	name: "Chat sync",
		// 	path: `/dashboard/bot/${guild.id}/chat-sync`
		// }
	];

	return (
		<>
			<Button as={Link} to="/dashboard/bot" leftIcon={<ArrowBackIcon />} mb={4}>
				Go back
			</Button>

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
						<Button
							key={link.name}
							as={Link}
							variant={"ghost"}
							to={link.path}
							pos="relative"
							color={pathname === link.path ? "whiteAlpha.900" : "textSec"}
						>
							{link.name}
							{pathname === link.path && (
								<Flex
									as={motion.div}
									layout
									layoutId="guild-setting"
									transition={
										{
											ease: config.ease,
											duration: 0.3
										} as Transition as any
									}
									pos="absolute"
									bottom={0}
									top={0}
									left={0}
									right={0}
									zIndex={-1}
									bg="brand.900"
									rounded={"xl"}
								/>
							)}
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
