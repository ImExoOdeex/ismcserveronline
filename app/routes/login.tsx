import { Button, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import DiscordIcon from "~/components/layout/icons/DiscordIcon";
import Link from "~/components/utils/Link";
import { redirect, type LoaderArgs, json } from "@remix-run/node";
import { authenticator } from "~/components/server/auth/authenticator.server";
import { useLoaderData } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { getSession } from "~/components/server/session.server";

export async function loader({ request }: LoaderArgs) {
	const auth = await authenticator.isAuthenticated(request);

	if (auth) {
		return redirect(`/dashboard`);
	}

	const session = await getSession(request.headers.get("Cookie"));
	const redirectURL = await session.get("redirect");
	console.log(redirectURL);

	const url = new URL(request.url);
	const failed = url.searchParams.get("message") === "fail";

	return json({ failed });
}

export default function Login() {
	const lastFailed = useRef({});
	const { failed } = useLoaderData<typeof loader>() || { failed: lastFailed };
	useEffect(() => {
		if (failed) lastFailed.current = failed;
	}, [failed]);

	return (
		<Flex w="100%" h="100%" justifyContent={"center"} minH={"calc(100vh - 128px)"} alignItems="center" px={4}>
			<VStack spacing={5} maxW={"450px"} w="100%" mx="auto">
				<Heading fontSize={{ base: "2xl", md: "3xl" }}>Log in into your Discord account</Heading>
				<Text color={failed ? "red" : "textSec"} fontWeight={failed ? 600 : 500} opacity={0.9} textAlign={"center"}>
					{failed
						? "Failed to login. Please try again."
						: "To access the web dashboard for discord. After authorization you will be redirected to dashboard."}
				</Text>

				<VStack align={"start"} w="100%">
					<Button
						prefetch="none"
						as={Link}
						to={`/api/auth/discord`}
						w="100%"
						bg={"#5865F2"}
						color={"white"}
						border=".5px solid"
						colorScheme="brand"
						borderColor={"alpha200"}
						_hover={{
							bg: "#6a58f2",
							textDecor: "none"
						}}
					>
						<HStack spacing={3} alignItems="center">
							<DiscordIcon />
							<Text fontWeight={"semibold"}>Login with Discord</Text>
						</HStack>
					</Button>
					<Text fontSize={"xs"} fontWeight={"thin"} opacity={0.9}>
						We do not store your access token.
					</Text>
				</VStack>
			</VStack>
		</Flex>
	);
}