import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { BiCode, BiLineChart } from "react-icons/bi/index.js";
import Link from "~/components/utils/Link";
import useUser from "~/components/utils/hooks/useUser";
import DiscordIcon from "../icons/DiscordIcon";

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
			tabIndex={-1}
			rightIcon={<BiLineChart />}
		>
			Popular servers
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
			tabIndex={-1}
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
			tabIndex={-1}
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

	if (user) {
		return (
			<Flex
				as={Link}
				px={2.5}
				py={1.5}
				rounded={"xl"}
				_hover={{
					textDecoration: "none",
					bg: "alpha"
				}}
				_active={{ scale: 0.9 }}
				transform={"auto-gpu"}
				transition={`all .2s ease-in-out`}
				to={"/dashboard"}
				alignItems={"center"}
				gap={3}
			>
				<Text>{user.nick}</Text>
				<Image src={user.photo ?? "/discordLogo.png"} rounded={"full"} boxSize={10} />
			</Flex>
		);
	}

	return (
		<Button
			as={Link}
			_hover={{ textDecoration: "none", bg: "discord.900" }}
			h="40px"
			px={4}
			fontWeight={500}
			bg="discord.100"
			rounded={"xl"}
			color={"white"}
			alignItems={"center"}
			userSelect={"none"}
			transform={"auto-gpu"}
			_active={{ scale: 0.9 }}
			to={"/login"}
			leftIcon={<DiscordIcon />}
		>
			Login
		</Button>
	);
}
