import { getCookieWithoutDocument } from "@/functions/cookies";
import Link from "@/layout/global/Link";
import { ClientStyleContext } from "@/utils/ClientContext";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Box, ChakraBaseProvider, Flex, Heading, Icon, Stack, Text, theme, VStack } from "@chakra-ui/react";
import { Links, Meta, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { BiCode, BiHome } from "react-icons/bi";
import { useTypedLoaderData } from "remix-typedjson";
import { type loader } from "./root";

interface DocumentProps {
	children: React.ReactNode;
}

export function Document({ children }: DocumentProps) {
	const clientStyleData = useContext(ClientStyleContext);
	const reinjectStylesRef = useRef(true);

	let { cookies } = useTypedLoaderData<typeof loader>();

	// run this only on client, cause the warning shits whole server
	if (typeof document !== "undefined") {
		// eslint-disable-next-line
		useLayoutEffect(() => {
			if (!reinjectStylesRef.current) return;

			clientStyleData?.reset();

			reinjectStylesRef.current = false;
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		cookies = document.cookie;
	}

	const themeValue = useMemo(() => {
		return getCookieWithoutDocument("chakra-ui-color-mode", cookies) ?? "dark";
	}, [cookies]);

	return (
		<html
			lang="en"
			style={{ colorScheme: themeValue, scrollBehavior: "smooth" }}
			data-theme={themeValue}
			suppressHydrationWarning
		>
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<script defer data-domain="ismcserver.online" src="https://analytics.ismcserver.online/js/script.js" />
			</body>
		</html>
	);
}

const links = [
	{ name: "Home", icon: BiHome, to: "/" },
	{ name: "FAQ", icon: QuestionOutlineIcon, to: "/faq" },
	{ name: "API", icon: BiCode, to: "/api" }
];

export function ErrorBoundary() {
	const clientStyleData = useContext(ClientStyleContext);
	const reinjectStylesRef = useRef(true);

	if (clientStyleData)
		// eslint-disable-next-line
		useLayoutEffect(() => {
			if (!reinjectStylesRef.current) return;

			clientStyleData?.reset();

			reinjectStylesRef.current = false;
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

	return (
		<html>
			<head>
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<link rel="icon" type="image/png" href="/favicon.ico" sizes="20x20" />
				<Links />
			</head>
			<body>
				<ChakraBaseProvider theme={theme}>
					<Flex h="100%" minH={"calc(100vh - 80px)"} px={4}>
						<InsideErrorBoundary />
					</Flex>
				</ChakraBaseProvider>
				<ScrollRestoration />
				<Scripts />
				<script defer data-domain="ismcserver.online" src="https://analytics.ismcserver.online/js/script.js" />
			</body>
		</html>
	);
}

export function InsideErrorBoundary() {
	const error = useRouteError();

	useEffect(() => {
		console.error(JSON.stringify(error, null, 2));
	}, [error]);

	return (
		<VStack m="auto" spacing={5} px={4}>
			<Heading>Oops... Something unexpected has just happend</Heading>
			<Heading fontSize={"lg"}>Please try refreshing the page, if error still occurs please contact admin</Heading>
			{error instanceof Error ? (
				<>
					<Heading color={"red"}>{error?.name}</Heading>
					<Box as="pre">{error?.message ? error?.message : error?.stack}</Box>
				</>
			) : (
				<Heading color={"red"}>Unknown error</Heading>
			)}
			<Stack direction={{ base: "column", sm: "row" }} spacing={5} w="100%" justifyContent={"center"}>
				{links.map((l) => (
					<Link
						to={l.to}
						key={l.name}
						rounded={"xl"}
						p={[3, 4, 5]}
						bg={"alpha"}
						w={{ base: "100%", sm: "100px" }}
						_hover={{
							textDecor: "none",
							bg: "alpha100"
						}}
					>
						<VStack fontWeight={"semibold"}>
							<Icon as={l.icon} />
							<Text>{l.name}</Text>
						</VStack>
					</Link>
				))}
			</Stack>
		</VStack>
	);
}
