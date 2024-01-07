import { Button, HStack, Heading, Image, Stack } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLocation, useOutlet } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import BotNotOnServer from "~/components/layout/dashboard/BotNotOnServer";
import { getUserGuilds } from "~/components/server/db/models/user";
import { requireSuperDuperToken } from "~/components/server/functions/env.server";
import { requireUserGuild } from "~/components/server/functions/secureDashboard.server";
import serverConfig from "~/components/server/serverConfig.server";
import Link from "~/components/utils/Link";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const guildID = params.guildID!;
	const userGuilds = await getUserGuilds(request);

	if (!userGuilds) throw redirect("/dashboard");

	await requireUserGuild(request, guildID, userGuilds);

	const guild = await fetch(`${serverConfig.botApi}/${guildID}/guild`, {
		method: "GET",
		headers: {
			Authorization: requireSuperDuperToken()
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
								: "https://notibot.app/discordLogo.png"
						}
						alt={guild.name + "'s icon"}
						boxSize={"16"}
					/>
					<Heading>{guild.name}</Heading>
				</HStack>

				<HStack>
					{links.map((link) => (
						<Button
							key={link.name}
							bg={pathname === link.path ? "alpha100" : "transparent"}
							_hover={{ textDecoration: "none", bg: "alpha" }}
							_active={{
								scale: 0.9
							}}
							transform={"auto-gpu"}
							prefetch="render"
							as={Link}
							variant={pathname === link.path ? "solid" : "ghost"}
							to={link.path}
						>
							{link.name}
						</Button>
					))}
				</HStack>
			</Stack>
			{outlet}
		</>
	);
}
