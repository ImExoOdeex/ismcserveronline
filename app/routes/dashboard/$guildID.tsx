import { Button, Heading, HStack, Image, Stack } from "@chakra-ui/react";
import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useLocation, useOutlet } from "@remix-run/react";
import { useEffect, useRef } from "react";
import BotNotOnServer from "~/components/layout/dashboard/BotNotOnServer";
import { getUserGuilds } from "~/components/server/db/models/getUserGuilds";
import { requireUserGuild } from "~/components/server/functions/secureDashboard";
import Link from "~/components/utils/Link";

export async function loader({ params, request }: LoaderArgs) {
	const guildID = params.guildID!;
	const userGuilds: any = await getUserGuilds(request);

	if (!userGuilds) return redirect("/dashboard");

	await requireUserGuild(request, guildID);

	const guild = await (
		await fetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/${guildID}/guild`,
			{
				method: "get",
				headers: {
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				}
			}
		)
	).json();

	const userContainsGuild = userGuilds.find((g: any) => g?.id === guild?.id) ? true : false;

	return json({ guild: userContainsGuild ? guild : null });
}

export default function $guildID() {
	const lastGuild = useRef(null);
	const { guild } = useLoaderData<typeof loader>() || {
		guild: lastGuild.current
	};

	useEffect(() => {
		if (guild) lastGuild.current = guild;
	}, [guild]);

	const outlet = useOutlet();
	const { pathname } = useLocation();

	if (!guild) {
		return <BotNotOnServer />;
	}

	const links = [
		{
			name: "Livecheck",
			path: `/dashboard/${guild.id}`
		},
		{
			name: "Config",
			path: `/dashboard/${guild.id}/config`
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
