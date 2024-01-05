import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Box, ChakraBaseProvider, Flex, Heading, Icon, Stack, Text, theme, VStack } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { Links, LiveReload, Meta, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import { useContext, useEffect, useMemo } from "react";
import { BiCode, BiHome } from "react-icons/bi/index.js";
import { useTypedLoaderData } from "remix-typedjson";
import { getCookieWithoutDocument } from "./components/utils/functions/cookies";
import Link from "./components/utils/Link";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { type loader } from "./root";

interface DocumentProps {
	children: React.ReactNode;
}

const Document = withEmotionCache(({ children }: DocumentProps, emotionCache) => {
	const serverStyleData = useContext(ServerStyleContext);
	const clientStyleData = useContext(ClientStyleContext);

	// Only executed on client
	useEffect(() => {
		// re-link sheet container
		emotionCache.sheet.container = document.head;
		// re-inject tags
		const tags = emotionCache.sheet.tags;
		emotionCache.sheet.flush();
		tags.forEach((tag) => {
			(emotionCache.sheet as any)._insertTag(tag);
		});
		// reset cache to reapply global styles
		clientStyleData?.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let { cookies, showAds } = useTypedLoaderData<typeof loader>();

	if (typeof document !== "undefined") {
		cookies = document.cookie;
	}

	const themeValue = useMemo(() => {
		return getCookieWithoutDocument("chakra-ui-color-mode", cookies) ?? "dark";
	}, [cookies]);

	return (
		<html lang="en" style={{ colorScheme: themeValue, scrollBehavior: "smooth" }} data-theme={themeValue}>
			<head>
				<Meta />
				<link rel="icon" type="image/png" href="/favicon.ico" sizes="20x20" />
				<Links />
				{showAds && (
					<script
						async
						src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4203392968171424"
						crossOrigin="anonymous"
					></script>
				)}
				{serverStyleData?.map(({ key, ids, css }) => (
					<style key={key} data-emotion={`${key} ${ids.join(" ")}`} dangerouslySetInnerHTML={{ __html: css }} />
				))}
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
});

const ErrorBoundary = withEmotionCache((_never, emotionCache) => {
	const serverStyleData = useContext(ServerStyleContext);
	const clientStyleData = useContext(ClientStyleContext);
	const error = useRouteError();

	// Only executed on client
	useEffect(() => {
		// re-link sheet container
		emotionCache.sheet.container = document.head;
		// re-inject tags
		const tags = emotionCache.sheet.tags;
		emotionCache.sheet.flush();
		tags.forEach((tag) => {
			(emotionCache.sheet as any)._insertTag(tag);
		});
		// reset cache to reapply global styles
		clientStyleData?.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const links = [
		{ name: "Home", icon: BiHome, to: "/" },
		{ name: "FAQ", icon: QuestionOutlineIcon, to: "/faq" },
		{ name: "API", icon: BiCode, to: "/api" }
	];

	return (
		<html>
			<head>
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<link rel="icon" type="image/png" href="/favicon.ico" sizes="20x20" />
				{/* <!-- Google Tag Manager --> */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(w,d,s,l,i){w[l] = w[l] || [];w[l].push({"gtm.start":
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WW2Z3RZ');`
					}}
				></script>
				{/* <!-- End Google Tag Manager --> */}
				{/* <!-- Google tag (gtag.js) --> */}
				<script async src="https://www.googletagmanager.com/gtag/js?id=G-F1BWR503G2"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F1BWR503G2');`
					}}
				></script>
				<Links />
				{serverStyleData?.map(({ key, ids, css }) => (
					<style key={key} data-emotion={`${key} ${ids.join(" ")}`} dangerouslySetInnerHTML={{ __html: css }} />
				))}
			</head>
			<body>
				<ChakraBaseProvider theme={theme}>
					<Flex h="100%" minH={"calc(100vh - 80px)"} px={4}>
						<VStack m="auto" spacing={5}>
							<Heading>Oops... Something unexpected has just happend</Heading>
							<Heading fontSize={"lg"}>
								Please try refreshing the page, if error still occurs please contact admin
							</Heading>
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
					</Flex>
				</ChakraBaseProvider>
			</body>
		</html>
	);
});

export { Document, ErrorBoundary };
