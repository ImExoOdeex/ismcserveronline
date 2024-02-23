import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Button, Icon } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { BiCode, BiLineChart } from "react-icons/bi";
import Link from "~/components/utils/Link";
import useUser from "~/components/utils/hooks/useUser";
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
			to={"/popular-servers"}
			as={Link}
			rounded={"xl"}
			bg={"transparent"}
			color="green"
			rightIcon={
				<Icon
					as={BiLineChart}
					color="green"
					// filter={"drop-shadow(0 0 5px #5cc877)"}
				/>
			}
			// textShadow={"0 0 12px #5cc877"}
		>
			Top Voted Servers
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
			rightIcon={<QuestionOutlineIcon />}
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
	const loginFetcher = useFetcher<any>();

	if (user) {
		return <ProfilePopover />;
	}

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
