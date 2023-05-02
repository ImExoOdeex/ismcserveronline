import { redirect, type LoaderArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { getUser } from "~/components/server/db/models/getUser";
import { Badge, Button, HStack, Heading, Icon, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";
import { getUserGuilds } from "~/components/server/db/models/getUserGuilds";
import { HiRefresh } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";

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

	const guilds = (await getUserGuilds(request))!;

	if (typeof guilds !== "object") {
		throw new Error("'Guilds' is not an object!");
	}

	return json({ guilds });
}

export default function Index() {
	const lastGuilds = useRef({});
	const { guilds }: { guilds: Guild[] } = useLoaderData() || { guilds: lastGuilds.current };
	useEffect(() => {
		if (guilds) lastGuilds.current = guilds;
	}, [guilds]);

	const refreshGuildsFetcher = useFetcher();

	return (
		<VStack w="100%" align={"start"}>
			<Heading fontSize={"3xl"}>Servers, that you can manage</Heading>
			<Text>There's a list of all your servers, that you can manage. Click of any you want to configure the bot!</Text>
			<VStack w="100%" align={"start"} spacing={10}>
				{guilds.length ? (
					<SimpleGrid w="100%" minChildWidth={{ base: "100%", md: "calc(33.333333% - 20px)" }} spacing={5}>
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
									prefetch="render"
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
				) : (
					<Heading fontSize={"xl"} textAlign={"center"} w="100" alignSelf={"center"} py={10} color="red">
						Sadly, you don't manage any servers :(
					</Heading>
				)}
				<HStack>
					<refreshGuildsFetcher.Form action="/api/auth/discord/reauthenticate">
						<Button
							transform={"auto-gpu"}
							_active={{ scale: 0.9 }}
							isLoading={refreshGuildsFetcher.state !== "idle"}
							type="submit"
							variant={"brand"}
						>
							<HStack>
								<Icon as={HiRefresh} />
								<Text>Refresh guilds</Text>
							</HStack>
						</Button>
					</refreshGuildsFetcher.Form>
					<Button
						as={Link}
						prefetch="none"
						to={"/api/auth/logout"}
						transform={"auto-gpu"}
						_active={{ scale: 0.9 }}
						variant={"ghost"}
						color={"red"}
					>
						<HStack>
							<Icon as={FiLogOut} />
							<Text>Logout</Text>
						</HStack>
					</Button>
				</HStack>
			</VStack>
		</VStack>
	);
}
