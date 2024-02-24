import { Button, Divider, Flex, HStack, Heading, VStack } from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLocation, useOutlet } from "@remix-run/react";
import { Transition } from "framer-motion";
import { useCallback, useMemo } from "react";
import { FiLogOut } from "react-icons/fi";
import { PiCrownSimpleDuotone } from "react-icons/pi";
import { ChakraBox } from "~/components/layout/MotionComponents";
import { getUserId } from "~/components/server/db/models/user";
import { commitSession, getSession } from "~/components/server/session.server";
import Link from "~/components/utils/Link";
import useUser from "../components/utils/hooks/useUser";

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
	const outlet = useOutlet();

	const user = useUser(true);

	const path = useLocation().pathname;

	const buttons = useMemo(() => {
		const yes = [
			{
				name: "Bookmarked Servers",
				to: "/dashboard"
			},
			{
				name: "Manage Discord Bot",
				to: "/dashboard/bot"
			},
			{
				name: "Add Server",
				to: "/dashboard/add-server"
			},
			{
				name: "API Token",
				to: "/dashboard/token"
			}
		];

		// doing this, cause on page transition if will loose the data, cuz it's weird
		if (user) {
			if (user.prime) {
				yes.push({
					name: "Prime",
					to: "/dashboard/prime"
				});
			}

			if (user.role === "ADMIN") {
				yes.push({
					name: "Admin",
					to: "/dashboard/admin"
				});
			}
		}

		return yes;
	}, [user]);

	const logoutFetcher = useFetcher();

	const prefetchGuildIcons = useCallback(() => {
		const url = `/dashboard/bot?_data=routes%2Fdashboard.bot._index`;

		fetch(url, {
			headers: {
				Accept: "application/json"
			}
		})
			.then((res) => {
				if (res.ok) {
					return res.json() as Promise<{
						guilds: { id: string; icon: string; name: string }[];
					}>;
				} else {
					console.log("Failed to prefetch guild icons");
				}
			})
			.then((data) => {
				if (!data) return;
				data.guilds.forEach((guild) => {
					const img = new Image();
					img.src = guild.icon
						? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`
						: "/banner.jpg";
					img.onload = () => {
						console.log("Prefetched image", guild.name);
					};
				});
			});
	}, []);

	if (!user) return null;
	return (
		<VStack w="100%" maxW={"1200px"} mx="auto" align={"start"} mt={5} spacing={10} px={4}>
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

			<Flex flexDir={"column"} gap={6} w="100%">
				<Flex
					flexDir={"column"}
					overflow={"auto"}
					overflowY={"hidden"}
					overflowX={{
						base: "auto",
						md: "hidden"
					}}
				>
					<Flex
						gap={0}
						w={{
							base: "min-content",
							md: "100%"
						}}
					>
						{buttons.map((button, i) => (
							<Button
								w={{
									base: "min-content",
									md: "100%"
								}}
								as={Link}
								variant={"ghost"}
								rounded={"none"}
								key={i}
								to={button.to}
								pos="relative"
								_hover={{
									bg: "alpha",
									textDecoration: "none"
								}}
								_active={{
									bg: "alpha100"
								}}
								opacity={path === button.to ? 1 : 0.8}
								fontWeight={500}
								onMouseEnter={button.to === "/dashboard/bot" ? prefetchGuildIcons : undefined}
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
										transition={
											{
												type: "spring",
												bounce: 0.15,
												duration: 0.75
											} as Transition as any
										}
									/>
								)}
							</Button>
						))}
					</Flex>
					<Divider />
				</Flex>

				{outlet}
			</Flex>
		</VStack>
	);
}
