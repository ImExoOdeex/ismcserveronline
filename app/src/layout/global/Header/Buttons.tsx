import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Badge, Button, HStack, Icon } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { BiCode } from "react-icons/bi";
import { PiAlignLeftBold } from "react-icons/pi";
import DiscordIcon from "../icons/DiscordIcon";
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

export function FAQButton() {
	return (
		<Button
			as={Link}
			to="/faq"
			transform={"auto-gpu"}
			_hover={{
				bg: "alpha",
				textDecor: "none"
			}}
			_active={{ bg: "alpha100", scale: 0.9 }}
			rounded={"xl"}
			bg={"transparent"}
			rightIcon={<InfoOutlineIcon />}
		>
			FAQ
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
