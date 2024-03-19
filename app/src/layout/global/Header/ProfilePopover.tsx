import { useActionKey } from "@/hooks/useActionKey";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import config from "@/utils/config";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
	Badge,
	Button,
	Divider,
	Flex,
	HStack,
	Icon,
	IconButton,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useEventListener
} from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { memo } from "react";
import { FiLogOut } from "react-icons/fi";
import { RxDiscordLogo } from "react-icons/rx";
import { TbCodeDots, TbLayoutDashboard } from "react-icons/tb";

const buttons = [
	{
		name: "Dashboard",
		icon: TbLayoutDashboard,
		path: "/dashboard",
		command: "d"
	},
	{
		name: "Manage Discord Bot",
		icon: RxDiscordLogo,
		path: "/dashboard/bot",
		command: "e"
	},
	{
		name: "API Token",
		icon: TbCodeDots,
		path: "/dashboard/token",
		command: "s"
	}
];

export default memo(function ProfilePopover() {
	const user = useUser(true);
	const actionKey = useActionKey();
	const navigate = useNavigate();

	useEventListener("keydown", (e) => {
		const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform);
		const hotkey = isMac ? "metaKey" : "ctrlKey";

		if (e[hotkey] && !e.shiftKey) {
			switch (e.key.toLowerCase()) {
				case buttons[0].command: {
					e.preventDefault();
					navigate("/dashboard");
					break;
				}
				case buttons[1].command: {
					e.preventDefault();
					navigate("/dashboard/bot");
					break;
				}
				case buttons[2].command: {
					e.preventDefault();
					navigate("/dashboard/token");
					break;
				}
				default:
					break;
			}
		}
	});

	const logoutFetcher = useFetcher();

	return (
		<>
			<Menu placement="top-end" isLazy closeOnSelect>
				{({ isOpen, onClose }) => (
					<>
						<MenuButton
							variant={{
								base: "unstyled",
								md: "ghost"
							}}
							rounded={{
								base: "full",
								md: "lg"
							}}
							as={Button}
							rightIcon={
								<Icon
									as={ChevronDownIcon}
									transform={"auto-gpu"}
									rotate={isOpen ? 180 : 0}
									transition={`transform 0.3s ${config.cubicEase}`}
									display={{
										base: "none",
										md: "block"
									}}
								/>
							}
							_hover={{
								bg: "alpha",
								textDecor: "none"
							}}
							_active={{
								bg: {
									base: "transparent",
									md: "alpha100"
								}
							}}
						>
							<HStack>
								<Image
									src={user.photo ?? "/discordLogo.png"}
									rounded={"full"}
									boxSize={{
										base: 10,
										md: 8
									}}
									userSelect={"none !important" as any}
								/>
								<Flex
									flexDir={"column"}
									display={{
										base: "none",
										md: "flex"
									}}
								>
									<Text userSelect={"none !important" as any} fontWeight={500}>
										{user.nick}
									</Text>
								</Flex>
							</HStack>
						</MenuButton>
						<MenuList
							onMouseLeave={() => {
								onClose();
							}}
							border="1px solid"
							borderColor={"alpha"}
							w="300px"
							bg="transparent"
							backdropFilter={"blur(30px)"}
							transform={"translate3d(0,0,0)"}
							pos="relative"
						>
							<Flex tabIndex={-1} w="100%" justifyContent={"space-between"} gap={4} px={2}>
								<HStack spacing={4}>
									<Image src={user.photo ?? "/discordLogo.png"} rounded={"full"} boxSize={"42px"} />
									<Flex flexDir={"column"}>
										<Text fontWeight={500} noOfLines={1}>
											{user.nick}
										</Text>
										<Badge
											fontSize={"11px"}
											w="min-content"
											fontWeight={500}
											colorScheme={user.role === "ADMIN" ? "pink" : user.prime ? "purple" : "green"}
										>
											{user.role === "ADMIN" ? "Admin" : user.prime ? "Prime" : "User"}
										</Badge>
									</Flex>
								</HStack>

								<logoutFetcher.Form method="POST" action="/api/auth/logout">
									<IconButton
										type="submit"
										isLoading={logoutFetcher.state !== "idle"}
										variant={"ghost"}
										aria-label="logout"
										icon={<Icon as={FiLogOut} color="red" />}
										_hover={{
											bg: "rgba(255, 0, 0, 0.1)"
										}}
										_active={{
											bg: "rgba(255, 0, 0, 0.2)",
											scale: 0.9
										}}
									/>
								</logoutFetcher.Form>
							</Flex>

							<Flex px={2} my={4} tabIndex={-1}>
								<Divider />
							</Flex>

							{buttons.map((button) => (
								<MenuItem
									key={button.name}
									h={10}
									bg="transparent"
									fontWeight={500}
									icon={<Icon as={button.icon} boxSize={5} />}
									commandSpacing={2}
									// onClick={() => navigate(button.path)}
									as={Link}
									to={button.path}
									_hover={{
										bg: "alpha",
										textDecor: "none"
									}}
									_active={{ bg: "alpha100" }}
									_focus={{ bg: "alpha100" }}
								>
									<Flex w="100%" alignItems={"center"} justifyContent={"space-between"}>
										{button.name}
										<Text opacity={0.5} fontSize={"xs"}>
											{actionKey + "+" + button.command}
										</Text>
									</Flex>
								</MenuItem>
							))}
						</MenuList>
					</>
				)}
			</Menu>
		</>
	);
});
