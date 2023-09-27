import { Divider, Flex, Heading, HStack, Text, useConst, VStack } from "@chakra-ui/react";
import { redirect, type LoaderArgs } from "@remix-run/node";
import { useLocation, useOutlet } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import AdaptiveAvatar from "~/components/layout/dashboard/AdaptiveAvatar";
import { ChakraBox } from "~/components/layout/MotionComponents";
import { getUser } from "~/components/server/db/models/user";
import { commitSession, getSession } from "~/components/server/session.server";
import Link from "~/components/utils/Link";

export async function loader({ request }: LoaderArgs) {
	const user = await getUser(request);

	const cookies = request.headers.get("Cookie");
	const session = await getSession(cookies);

	if (!user) {
		return redirect("/login");
	}

	const redirectURL = await session.get("redirect");
	const guildID = await session.get("guild");

	if (redirectURL) {
		session.unset("redirect");
		session.unset("guild");

		return redirect(`/dashboard/bot/${guildID}${redirectURL === "index" ? "" : "/" + redirectURL}`, {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	return typedjson({ user });
}

export default function Dashboard() {
	const outlet = useOutlet();

	const lastUser = useRef(null) as any;
	const {
		user
	}: {
		user: {
			id: number;
			email: string;
			snowflake: string;
			nick: string;
			photo: string | null;
			bio: string | null;
		};
	} = useTypedLoaderData<any>() || { user: lastUser.current };
	useEffect(() => {
		if (user) lastUser.current = user;
	}, [user]);

	const path = useLocation().pathname;

	const buttons = useConst([
		{
			name: "Saved Servers",
			to: "/dashboard"
		},
		{
			name: "Managae Discord Bot",
			to: "/dashboard/bot"
		}
	]);

	return (
		<VStack w="100%" maxW={"1200px"} mx="auto" align={"start"} mt={5} spacing={10} px={4}>
			<VStack w="100%" align={"start"}>
				<Flex
					w="100%"
					justify={"space-between"}
					alignItems={{ base: "flex-start", sm: "center" }}
					flexDir={{
						base: "column",
						sm: "row"
					}}
					gap={4}
				>
					<Heading fontSize={"4xl"} as={Link} to="/dashboard">
						Dashboard
					</Heading>

					<HStack spacing={4}>
						<AdaptiveAvatar name={user.nick} photo={user.photo} boxSize={12} />
						<Flex flexDir={"column"}>
							<Text fontWeight={600}>{user.nick}</Text>
							<Text fontSize={"sm"}>{user.email}</Text>
						</Flex>
					</HStack>
				</Flex>
				<Divider />
			</VStack>

			<Flex flexDir={"column"} gap={6} w="100%">
				<Flex gap={4}>
					{buttons.map((button, i) => (
						<Link
							key={i}
							to={button.to}
							pos="relative"
							_hover={{
								textDecoration: "none",
								opacity: 1
							}}
							opacity={path === button.to ? 1 : 0.8}
							fontWeight={500}
						>
							{button.name}
							{path === button.to && (
								<ChakraBox
									pos="absolute"
									bottom={0}
									left={0}
									w="100%"
									h="2px"
									bg="brand"
									layout
									layoutId="dashunderline"
								/>
							)}
						</Link>
					))}
				</Flex>

				{outlet}
			</Flex>
		</VStack>
	);
}
