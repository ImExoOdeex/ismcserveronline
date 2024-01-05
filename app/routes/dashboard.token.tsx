import { CopyIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Button, Code, Divider, Flex, HStack, Heading, Icon, IconButton, Text, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { RiAiGenerate } from "react-icons/ri/index.js";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { db } from "~/components/server/db/db.server";
import { getUserId } from "~/components/server/db/models/user";
import { requireDomain } from "~/components/server/functions/security.server";

export async function action({ request }: ActionFunctionArgs) {
	requireDomain(request);
	const userId = await getUserId(request);
	invariant(userId, "User is not logged in");

	const userExistsInDb = (await db.token.findUnique({
		where: {
			user_id: userId
		}
	}))
		? true
		: false;

	if (userExistsInDb) throw new Error("Token already exists");

	const token = crypto.randomUUID();

	await db.token.create({
		data: {
			token: token,
			user_id: userId
		}
	});

	return typedjson({
		success: true
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await getUserId(request);
	invariant(userId, "User is not logged in");

	const token = await db.token
		.findUnique({
			where: {
				user_id: userId
			},
			select: {
				_count: {
					select: {
						check: true
					}
				},
				token: true,
				created_at: true
			}
		})
		.catch(() => null);

	return typedjson({
		token
	});
}

export default function DashboardToken() {
	const lastToken = useRef({});
	const { token } = useTypedLoaderData<typeof loader>() || { token: lastToken.current };
	useEffect(() => {
		if (token) lastToken.current = token;
	}, [token]);

	const [show, setShow] = useState(false);

	return (
		<Flex flexDir={"column"} gap={4} alignItems={"flex-start"}>
			<VStack align="start">
				<Heading fontSize={"2xl"}>Your API Token</Heading>
				<Text>Here you can generate your token for our API.</Text>
			</VStack>

			<Flex
				flexDir={{
					base: "column",
					md: "row"
				}}
				gap={4}
				alignItems={{
					base: "flex-start",
					md: "center"
				}}
				p={4}
				rounded={"xl"}
				border="1px solid"
				borderColor={"alpha300"}
				w="100%"
				justifyContent={"space-between"}
			>
				<Flex flexDir={"column"} gap={0.5} flex={1}>
					<Text fontWeight={500}>Token</Text>
					<Text fontSize={"xl"} fontWeight={600}>
						{token ? (
							<HStack>
								<Text fontSize={"xl"} fontWeight={600} fontFamily={"monospace"}>
									{show ? token.token : "*".repeat(token.token.length)}
								</Text>
								<IconButton
									onClick={() => setShow(!show)}
									aria-label={"Show Token"}
									icon={!show ? <ViewIcon /> : <ViewOffIcon />}
									size={"sm"}
									bg="alpha"
									_hover={{
										bg: "alpha100"
									}}
									_active={{
										bg: "alpha200"
									}}
								/>
								<IconButton
									onClick={() => {
										navigator.clipboard.writeText(token.token);
									}}
									aria-label={"Copy Token"}
									icon={<CopyIcon />}
									size={"sm"}
									bg="alpha"
									_hover={{
										bg: "alpha100"
									}}
									_active={{
										bg: "alpha200"
									}}
								/>
							</HStack>
						) : (
							"None"
						)}
					</Text>
				</Flex>

				{token ? (
					<>
						<Flex flexDir={"column"} gap={0.5} flex={1}>
							<Text fontWeight={500}>Checks</Text>
							<Text fontSize={"xl"} fontWeight={600}>
								<Text fontSize={"xl"} fontWeight={600} fontFamily={"monospace"}>
									{token._count.check}
								</Text>
							</Text>
						</Flex>
					</>
				) : (
					<GenerateToken />
				)}
			</Flex>

			<Divider my={10} />

			<Text>
				You can use your token to access our API. Put this token in the <Code>Authorization</Code> header of your
				requests. Keep your token safe. In case you want to delete it, you have to contact us.
			</Text>
		</Flex>
	);
}

function GenerateToken() {
	const fetcher = useFetcher();

	return (
		<fetcher.Form method="POST">
			<Button variant={"brand"} type="submit" isLoading={fetcher.state !== "idle"} rightIcon={<Icon as={RiAiGenerate} />}>
				Generate Token
			</Button>
		</fetcher.Form>
	);
}
