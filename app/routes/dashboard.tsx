import { getUserId } from "@/.server/db/models/user";
import { commitSession, getSession } from "@/.server/session";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import Sidebar from "@/layout/routes/dashboard/Sidebar";
import { Box, Button, Divider, Flex, HStack, Heading, VStack, useColorMode } from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useFetcher } from "@remix-run/react";
import { FiLogOut } from "react-icons/fi";
import { PiCrownSimpleDuotone } from "react-icons/pi";

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "Dashboard | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await getUserId(request);

	const cookies = request.headers.get("Cookie");
	const session = await getSession(cookies);

	if (!userId) {
		throw redirect("/login");
	}

	const redirectURL = await session.get("redirect");
	const guildID = await session.get("guild");

	if (redirectURL) {
		session.unset("redirect");
		session.unset("guild");

		throw redirect(`/dashboard/bot/${guildID}${redirectURL === "index" ? "" : "/" + redirectURL}`, {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	return null;
}

export default function Dashboard() {
	const { colorMode } = useColorMode();
	const user = useUser(true);

	const logoutFetcher = useFetcher();

	if (!user) return null;
	return (
		<VStack w="100%" maxW={"1400px"} mx="auto" align={"start"} mt={5} spacing={10} px={4}>
			<Flex flexDir={"column"} w="100%" gap={4}>
				<Flex w="100%" alignItems={"center"} justifyContent={"space-between"}>
					<Heading fontSize={"2xl"}>
						<Box
							as="span"
							bgClip="text"
							bgGradient={`linear(to-r, ${colorMode === "light" ? "#d16ede" : "#da92e4"}, #866ec7)`}
						>
							{user.nick}
						</Box>
					</Heading>
					<HStack>
						<Button
							as={Link}
							to="/prime"
							variant={"ghost"}
							color={"brand"}
							_hover={{
								bg: "rgba(72, 0, 255, 0.1)",
								textDecoration: "none"
							}}
							_active={{
								scale: 0.9
							}}
							transform={"auto-gpu"}
							fontWeight={500}
							rightIcon={<PiCrownSimpleDuotone />}
						>
							Prime
						</Button>

						<logoutFetcher.Form action="/api/auth/logout">
							<Button
								transform={"auto-gpu"}
								_hover={{
									bg: "rgba(255, 0, 0, 0.1)",
									textDecor: "none"
								}}
								_active={{ scale: 0.9 }}
								type="submit"
								variant={"ghost"}
								color={"red"}
								rightIcon={<FiLogOut />}
								isLoading={logoutFetcher.state !== "idle"}
							>
								Logout
							</Button>
						</logoutFetcher.Form>
					</HStack>
				</Flex>

				<Divider />
			</Flex>

			<Flex
				gap={10}
				w="100%"
				flexDir={{
					base: "column",
					md: "row"
				}}
			>
				<Sidebar />
				<Outlet />
			</Flex>
		</VStack>
	);
}
