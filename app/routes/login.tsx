import { Button, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { json, type LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { redirect } from "remix-typedjson";
import DiscordIcon from "~/components/layout/icons/DiscordIcon";
import { authenticator } from "~/components/server/auth/authenticator.server";
import { getSession } from "~/components/server/session.server";

export async function loader({ request }: LoaderArgs) {
	const auth = await authenticator.isAuthenticated(request);

	if (auth) {
		throw redirect(`/dashboard`);
	}

	const url = new URL(request.url);
	const failed = url.searchParams.get("message") === "fail";
	const redirectParam = url.searchParams.get("redirect");

	if (redirectParam === "") {
		const session = await getSession(request.headers.get("Cookie"));
		console.log("login");
		console.table({
			redirect: await session.get("redirect"),
			guild: await session.get("guild")
		});

		throw redirect(`/api/auth/discord`);
	}

	return json({ failed });
}

export default function Login() {
	const lastFailed = useRef({});
	const { failed } = useLoaderData<typeof loader>() || { failed: lastFailed };
	useEffect(() => {
		if (failed) lastFailed.current = failed;
	}, [failed]);

	const fetcher = useFetcher();

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
					<fetcher.Form method="POST" action="/api/auth/discord" style={{ width: "100%" }}>
						<Button
							type="submit"
							isLoading={fetcher.state !== "idle"}
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
					</fetcher.Form>
					<Text fontSize={"xs"} fontWeight={"thin"} opacity={0.9}>
						We do not store your access token.
					</Text>
				</VStack>
			</VStack>
		</Flex>
	);
}
