import { redirect, type LoaderArgs, json, fetch } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { getUser } from "~/components/server/db/models/getUser";
import { Badge, HStack, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";

export type Guild = {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: number;
	features: string[];
	permissions_new: string;
};

export async function loader({ request }: LoaderArgs) {
	const user = await getUser(request);

	if (!user) {
		return redirect("/login");
	}

	console.log("fetching guilds");

	const response = await (
		await fetch(`https://discord.com/api/users/@me/guilds`, {
			method: "get",
			headers: {
				Authorization: `Bearer ${user.access_token}`
			}
		})
	).json();

	if (!response) {
		return redirect("/dashboard");
	}

	const guilds: Guild[] = response;

	return json({ guilds });
}

export default function Index() {
	const lastGuilds = useRef({});
	const { guilds } = useLoaderData<typeof loader>() || { guilds: lastGuilds.current };
	useEffect(() => {
		if (guilds) lastGuilds.current = guilds;
	}, [guilds]);

	return (
		<VStack w="100%" align={"start"}>
			<Text>There's a list of all your servers, that you can manage. Click of any you want to configure the bot!</Text>
			<SimpleGrid w="100%" minChildWidth={"calc(33.333333% - 20px)"} spacing={5}>
				{guilds
					.filter((guild: Guild) => (guild.permissions & 0x20) == 0x20)
					.sort((a: Guild, b: Guild) => {
						if (a.owner === true && b.owner !== true) {
							return -1;
						} else if (b.owner === true && a.owner !== true) {
							return 1;
						} else {
							return 0;
						}
					})
					.map((guild) => (
						<VStack
							key={guild.id}
							as={Link}
							to={guild.id}
							rounded={"xl"}
							bg="alpha"
							w="100%"
							align={"center"}
							justifyContent={"center"}
							flexDir={"column"}
							p={5}
							transition={"background .2s"}
							_hover={{ bg: "alpha100", textDecor: "none" }}
						>
							<Image
								rounded={"full"}
								src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`}
								alt={guild.name + "'s name"}
								boxSize={12}
							/>
							<HStack>
								<Text fontWeight={"bold"} fontSize={"xl"}>
									{guild.name}
								</Text>
								{guild.owner && <Badge colorScheme="orange">Admin</Badge>}
							</HStack>
							{/* {(guild.permissions & 0x20) == 0x20 ? "lmaooooooooooo" : "NOP"} */}
						</VStack>
					))}
			</SimpleGrid>
		</VStack>
	);
}
