import { HStack, Heading, Image, VStack } from "@chakra-ui/react";
import { fetch, json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRef, useEffect } from "react";
import BotNotOnServer from "~/components/layout/dashboard/BotNotOnServer";
import { type Guild } from ".";

export async function loader({ params }: LoaderArgs) {
	const guildID = params.guildID!;

	const response = await fetch(
		`${process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"}/guild/${guildID}`,
		{
			method: "get",
			headers: {
				Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
			}
		}
	);

	const { guild }: { guild: Guild } = await response.json();

	return json({ guild });
}

export default function $guildID() {
	const lastGuild = useRef({});
	const { guild } = useLoaderData<typeof loader>() || { guild: lastGuild.current };
	useEffect(() => {
		if (guild) lastGuild.current = guild;
	}, [guild]);

	if (!guild) {
		return <BotNotOnServer />;
	}

	return (
		<VStack w="100%" align={"start"}>
			<HStack spacing={5}>
				<Image
					rounded={"full"}
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=256`}
					alt={guild.name + "'s icon"}
					boxSize={"16"}
				/>
				<Heading textDecoration={"underline"}>{guild.name}</Heading>
			</HStack>
		</VStack>
	);
}
