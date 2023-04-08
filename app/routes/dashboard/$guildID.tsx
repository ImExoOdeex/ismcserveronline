import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useLocation, useOutlet } from "@remix-run/react";
import BotNotOnServer from "~/components/layout/dashboard/BotNotOnServer";
import { useRef, useEffect } from "react";
import { Button, Heading, HStack, Image, Stack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";
import { getUserGuilds } from "~/components/server/db/models/getUserGuilds";

export async function loader({ params, request }: LoaderArgs) {
	const guildID = params.guildID!;
	const userGuilds: any = await getUserGuilds(request);

	if (!userGuilds) return redirect("/dashboard");

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

	return (
		<>
			<Stack direction={{ base: "column", md: "row" }} spacing={10}>
				<HStack spacing={5}>
					<Image
						rounded={"full"}
						src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=256`}
						alt={guild.name + "'s icon"}
						boxSize={"16"}
					/>
					<Heading>{guild.name}</Heading>
				</HStack>

				<HStack>
					<Button
						_hover={{ textDecoration: "none", bg: "alpha100" }}
						prefetch="render"
						as={Link}
						variant={pathname === `/dashboard/${guild.id}` ? "solid" : "ghost"}
						to={`/dashboard/${guild.id}`}
					>
						Livecheck
					</Button>
					<Button
						_hover={{ textDecoration: "none", bg: "alpha100" }}
						prefetch="render"
						as={Link}
						variant={pathname === `/dashboard/${guild.id}/config` ? "solid" : "ghost"}
						to={`/dashboard/${guild.id}/config`}
					>
						Config
					</Button>
				</HStack>
			</Stack>
			{outlet}
		</>
	);
}
