import { getCookieWithoutDocument } from "@/functions/cookies";
import Link from "@/layout/global/Link";
import { ClientStyleContext } from "@/utils/ClientContext";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Box, Button, ChakraBaseProvider, Flex, Heading, Icon, theme } from "@chakra-ui/react";
import { Links, Meta, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from "@remix-run/react";
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
		console.error("error", JSON.stringify(error, null, 2));
	}, [error]);

	return (
		<Flex flexDir={"column"} gap={4} px={4} w="100%" alignItems={"center"}>
			{isRouteErrorResponse(error) ? (
				<>
					<Heading color={"red"}>{error?.status}</Heading>
					<Box as="pre">{error?.statusText ? error?.statusText : error?.data}</Box>
				</>
			) : (
				<Heading color={"red"}>Unknown error</Heading>
			)}
			<Flex direction={{ base: "column", sm: "row" }} gap={2}>
				{links.map((l) => (
					<Button key={l.name} size="lg" as={Link} to={l.to} leftIcon={<Icon as={l.icon} />}>
						{l.name}
					</Button>
				))}
			</Flex>
		</Flex>
	);
}
