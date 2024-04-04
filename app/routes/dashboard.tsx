import { getUserId } from "@/.server/db/models/user";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import Sidebar from "@/layout/routes/dashboard/Sidebar";
import { Box, Button, Divider, Flex, HStack, Heading, VStack, useColorMode } from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useFetcher, useMatches } from "@remix-run/react";
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

	if (!userId) {
		throw redirect("/login");
	}

	return null;
}

export default function Dashboard() {
	const { colorMode } = useColorMode();
	const user = useUser(true);

	const logoutFetcher = useFetcher();

	const botDashboardLayoutMatches = useMatches().find((m) => m.id === "routes/dashboard.bot.$guildID");
	const shouldShowSidebar = (botDashboardLayoutMatches?.handle as any)?.showSidebar !== false;

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
							rightIcon={<PiCrownSimpleDuotone />}
						>
							Prime
						</Button>

						<Box
							as={logoutFetcher.Form}
							action="/api/auth/logout"
							method="DELETE"
							display={{
								base: "none",
								md: "block"
							}}
						>
							<Button
								_hover={{
									bg: "rgba(255, 0, 0, 0.1)",
									textDecor: "none"
								}}
								type="submit"
								variant={"ghost"}
								color={"red"}
								rightIcon={<FiLogOut />}
								isLoading={logoutFetcher.state !== "idle"}
							>
								Logout
							</Button>
						</Box>
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
				{shouldShowSidebar && <Sidebar />}
				<Outlet />
			</Flex>
		</VStack>
	);
}
