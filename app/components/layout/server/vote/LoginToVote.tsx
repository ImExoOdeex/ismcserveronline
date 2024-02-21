import { Button, Heading } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { memo } from "react";
import DiscordIcon from "../../icons/DiscordIcon";
import { VoteOverlay } from "./Vote";

export default memo(function LoginToVote() {
	const loginFetcher = useFetcher<any>();

	return (
		<VoteOverlay
			alignItems={{
				base: "flex-start",
				md: "center"
			}}
			flexDir={{
				base: "column",
				md: "row"
			}}
			justifyContent={"space-between"}
			gap={5}
		>
			<Heading fontSize={"xl"}>You need to login to vote for this server</Heading>

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
					Login with discord
				</Button>
			</loginFetcher.Form>
		</VoteOverlay>
	);
});
