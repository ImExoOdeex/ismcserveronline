import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { useCallback, useMemo } from "react";
import { FiSettings } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { PiCrownSimpleDuotone } from "react-icons/pi";
import { RxDiscordLogo } from "react-icons/rx";
import { TbCodeDots } from "react-icons/tb";

export default function Sidebar() {
	const path = useLocation().pathname;
	const user = useUser(true);

	const buttons = useMemo(() => {
		const buttons = [
			{
				name: "General",
				to: "",
				icon: FiSettings
			},
			{
				name: "Manage Discord bot",
				to: "/bot",
				icon: RxDiscordLogo
			},
			{
				name: "API Token",
				to: "/token",
				icon: TbCodeDots
			}
		];

		if (user.prime) {
			buttons.push({
				name: "Prime",
				to: "/prime",
				icon: PiCrownSimpleDuotone
			});
		}

		if (user.role === "ADMIN") {
			buttons.push({
				name: "Admin",
				to: "/admin",
				icon: MdOutlineAdminPanelSettings
			});
		}

		return buttons;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	return (
		<Flex
			flexDir={"column"}
			w="100%"
			maxW={{
				base: "100%",
				md: "300px"
			}}
			minW={{
				base: "100%",
				md: "300px"
			}}
		>
			<Flex w="100%" alignItems={"center"} mb={2}>
				<Text fontSize={"2xl"} fontWeight={600}>
					Dashboard
				</Text>
			</Flex>

			{buttons.map((button) => {
				const isActive = path === `/dashboard${button.to}`;

				return (
					<Button
						key={button.to}
						as={Link}
						rounded={"none"}
						to={`/dashboard${button.to}`}
						variant={isActive ? "solid" : "ghost"}
						justifyContent={"flex-start"}
						leftIcon={<Icon as={button.icon} boxSize={5} mr={1} />}
						onMouseEnter={button.to === "bot" ? prefetchGuildIcons : undefined}
					>
						<Flex w="100%" justifyContent="space-between">
							{button.name}
						</Flex>
					</Button>
				);
			})}
		</Flex>
	);
}
