import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import DiscordIcon from "@/layout/global/icons/DiscordIcon";
import config from "@/utils/config";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Badge, Button, HStack, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { BiCode } from "react-icons/bi";
import { FaDiscord } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { PiAlignLeftBold } from "react-icons/pi";
import ProfilePopover from "./ProfilePopover";

export function PopularServersButton() {
	return (
		<Button
			_hover={{
				bg: "alpha",
				textDecor: "none"
			}}
			_active={{ bg: "alpha100", scale: 0.9 }}
			transform={"auto-gpu"}
			to={"/search"}
			as={Link}
			rounded={"xl"}
			bg={"transparent"}
			pos={"relative"}
			rightIcon={
				<HStack>
					<Icon as={PiAlignLeftBold} />
					<Badge colorScheme="green">New</Badge>
				</HStack>
			}
		>
			Servers
		</Button>
	);
}

export function APIButton() {
	return (
		<Button
			_hover={{
				bg: "alpha",
				textDecor: "none"
			}}
			_active={{ bg: "alpha100", scale: 0.9 }}
			rounded={"xl"}
			bg={"transparent"}
			as={Link}
			transform={"auto-gpu"}
			to={"/api"}
			rightIcon={<BiCode />}
		>
			API
		</Button>
	);
}

export function LoginButton() {
	const user = useUser();

	return user ? <ProfilePopover /> : <LoginDiscordButton />;
}

function LoginDiscordButton() {
	const loginFetcher = useFetcher();

	return (
		<loginFetcher.Form action="/login" method="POST">
			<Button
				isLoading={loginFetcher.state !== "idle"}
				type="submit"
				_hover={{ textDecoration: "none", bg: "discord.900" }}
				px={4}
				fontWeight={500}
				bg="discord.100"
				color={"white"}
				alignItems={"center"}
				userSelect={"none"}
				transform={"auto-gpu"}
				_active={{ scale: 0.9 }}
				rightIcon={<DiscordIcon />}
			>
				Log in
			</Button>
		</loginFetcher.Form>
	);
}

const utilLinks = [
	{
		name: "Faq",
		icon: InfoOutlineIcon,
		to: "/faq"
	},
	{
		name: "Plugin",
		icon: FiDownload,
		to: "/plugin"
	},
	{
		name: "Discord Server",
		icon: FaDiscord,
		to: "/discord",
		isExternal: true
	}
];

export function Dots() {
	return (
		<>
			<Menu>
				<MenuButton
					as={IconButton}
					variant={"unstyled"}
					aria-label="Open Utility Menu"
					icon={<HiDotsVertical />}
					display={{
						base: "none",
						lg: "flex"
					}}
					alignItems={"center"}
					justifyContent={"center"}
					_active={{
						scale: 1
					}}
					opacity={0.8}
					_hover={{
						opacity: 1
					}}
					transition={`opacity 0.2s ${config.cubicEase}`}
				/>
				<MenuList bg="bg">
					{utilLinks.map((link) => (
						<MenuItem
							key={link.name}
							h={10}
							bg="transparent"
							fontWeight={500}
							icon={<Icon as={link.icon} boxSize={5} />}
							commandSpacing={2}
							as={Link}
							to={link.to}
							_hover={{
								bg: "alpha",
								textDecor: "none"
							}}
							_active={{ bg: "alpha100" }}
							_focus={{ bg: "alpha100" }}
							isExternal={link?.isExternal ?? false}
						>
							{link.name}
						</MenuItem>
					))}
				</MenuList>
			</Menu>
		</>
	);
}
