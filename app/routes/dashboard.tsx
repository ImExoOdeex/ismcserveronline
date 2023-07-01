import { Divider, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { redirect, type LoaderArgs } from "@remix-run/node";
import { useOutlet } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import AdaptiveAvatar from "~/components/layout/dashboard/AdaptiveAvatar";
import { getUser } from "~/components/server/db/models/getUser";
import { commitSession, getSession } from "~/components/server/session.server";
import Link from "~/components/utils/Link";

export async function loader({ request }: LoaderArgs) {
	const user = await getUser(request);

	const url = new URL(request.url);
	const cookies = request.headers.get("Cookie");
	const session = await getSession(cookies);

	const redirectURLParam = url.searchParams.get("redirect") as string;
	const guildIDParam = url.searchParams.get("guild") as string;

	if (!user) {
		session.set("redirect", redirectURLParam);
		session.set("guild", guildIDParam);

		return redirect("/login", {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	if (redirectURLParam && guildIDParam) {
		return redirect(url.pathname);
	}

	const redirectURL = session.get("redirect");
	const guildID = session.get("guild");

	if (redirectURL) {
		session.unset("redirect");
		session.unset("guild");

		return redirect(`/dashboard/${guildID}${redirectURL === "index" ? "" : "/" + redirectURL}`, {
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
					<Heading fontSize={"5xl"} as={Link} to="/dashboard">
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
			{outlet}
		</VStack>
	);
}
