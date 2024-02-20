import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { BiCode, BiLineChart } from "react-icons/bi";
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
			rightIcon={<Icon as={BiLineChart} filter={"drop-shadow(0 0 5px #5cc877)"} />}
			textShadow={"0 0 12px #5cc877"}
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

	if (user) {
		return (
			<Flex
				as={Link}
				px={4}
				py={1}
				rounded={"lg"}
				_hover={{
					textDecoration: "none",
					bg: "alpha100"
				}}
				_active={{ scale: 0.9 }}
				transform={"auto-gpu"}
				transition={`all .2s ease-in-out`}
				to={"/dashboard"}
				alignItems={"center"}
				gap={3}
			>
				<Text userSelect={"none !important" as any}>{user.nick}</Text>
				<Image src={user.photo ?? "/discordLogo.png"} rounded={"full"} boxSize={9} />
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
