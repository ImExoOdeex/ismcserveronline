import { Button, Flex, Image, Text } from "@chakra-ui/react";
import useUser from "~/components/utils/func/hooks/useUser";
import Link from "~/components/utils/Link";
import DiscordIcon from "../icons/DiscordIcon";

export default function LoginButton() {
	const user = useUser();

	if (user) {
		return (
			<Flex
				as={Link}
				px={2}
				rounded={"xl"}
				_hover={{ textDecoration: "none" }}
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
