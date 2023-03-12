import {
	Box,
	ChakraProvider,
	Flex,
	Heading,
	Icon,
	Stack,
	Text,
	VStack,
	cookieStorageManagerSSR,
	localStorageManager,
	useConst
} from "@chakra-ui/react";
import { type ActionArgs, json, redirect, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLoaderData,
	useLocation,
	useOutlet
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect } from "react";
import Layout from "./components/layout/Layout";
import theme from "./components/utils/theme";
import { type LinksFunction } from "@remix-run/react/dist/routeModules";
import { getCookieWithoutDocument } from "./components/utils/func/cookiesFunc";
import { withEmotionCache } from "@emotion/react";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { validateServer } from "./components/server/validateServer";
import Link from "./components/utils/Link";
import { BiCode, BiHome } from "react-icons/bi";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { GlobalContext } from "./components/utils/GlobalContext";

// ----------------------------- META -----------------------------

export const meta: MetaFunction = () => ({
	title: "IsMcServer.online",
	robots: "all",
	description: "Check Minecraft server status and data by real-time.",
	keywords:
		"Minecraft server check, Server status check, Minecraft server status, Online server status, Minecraft server monitor, Server checker tool, Minecraft server checker, Real-time server status, Minecraft server status checker, Server uptime checker, Minecraft server monitor tool, Minecraft server status monitor, Real-time server monitoring, Server availability checker, Minecraft server uptime checker",
	charset: "utf-8",
	viewport: "width=device-width,initial-scale=1",
	author: ".imexoodeex#0528"
});

interface DocumentProps {
	children: React.ReactNode;
}

interface DocumentErrorProps {
	children: React.ReactNode;
	error: Error;
}

// ----------------------------- LOADER -----------------------------

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const term = url.searchParams.get(process.env.NO_ADS_PARAM_NAME ?? "nope");

	const shouldRedirect: boolean = term?.toString() === process.env.NO_ADS_PARAM_VALUE;
	if (shouldRedirect) {
		return redirect(url.pathname, {
			headers: [["Set-Cookie", `no_ads=${process.env.NO_ADS_PARAM_VALUE}`]]
		});
	}

	const showAds: boolean =
		getCookieWithoutDocument("no_ads", request.headers.get("cookie") ?? "") !== process.env.NO_ADS_PARAM_VALUE;
	// ^^^ code for no ads up there uwu ^^^

	return json({ cookies: request.headers.get("cookie") ?? "", showAds });
};

// ----------------------------- DOCUMENT -----------------------------

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

	let { cookies, showAds } = useLoaderData<typeof loader>();

	if (typeof document !== "undefined") {
		cookies = document.cookie;
	}

	const themeValue = getCookieWithoutDocument("chakra-ui-color-mode", cookies) ?? "dark";

	return (
		<html lang="en" style={{ colorScheme: themeValue, scrollBehavior: "smooth" }} data-theme={themeValue}>
			<head>
				<Meta />
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
				<link rel="stylesheet" href="/style.css" />
			</head>
			<body>
				{/* <!-- Google Tag Manager (noscript) --> */}
				<noscript>
					<iframe
						title="Google Tag Manager"
						src="https://www.googletagmanager.com/ns.html?id=GTM-WW2Z3RZ"
						height="0"
						width="0"
						style={{ display: "none", visibility: "hidden" }}
					></iframe>
				</noscript>
				{/* <!-- End Google Tag Manager (noscript) --> */}
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
});

// ----------------------------- LINKS -----------------------------

export const links: LinksFunction = () => {
	return [
		{ rel: "preconnect", href: "https://fonts.googleapis.com" },
		{
			rel: "preconnect",
			href: "https://fonts.gstatic.com",
			crossOrigin: "anonymous"
		},
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&&family=Outfit:wght@700;800;900&display=swap"
		}
	];
};

// ----------------------------- APP -----------------------------

export default function App() {
	const { cookies } = useLoaderData();
	const cookieManager = useConst(cookieStorageManagerSSR(cookies));
	const location = useLocation();
	const outlet = useOutlet();

	return (
		<Document>
			<ChakraProvider
				resetCSS
				theme={theme}
				colorModeManager={typeof cookies === "string" ? cookieManager : localStorageManager}
			>
				<GlobalContext>
					<Layout>
						<AnimatePresence initial={false} mode="wait">
							<motion.main
								key={location.pathname}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									ease: [0.25, 0.1, 0.25, 1],
									duration: 0.1125
								}}
							>
								{outlet}
							</motion.main>
						</AnimatePresence>
					</Layout>
				</GlobalContext>
			</ChakraProvider>
		</Document>
	);
}

// ----------------------------- ACTION -----------------------------

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	const bedrock = getCookieWithoutDocument("bedrock", request.headers.get("Cookie") ?? "");

	const server = formData.get("server")?.toString().toLowerCase();

	if (!server) {
		return null;
	}

	const error = validateServer(server);
	if (error) return json({ error });

	return redirect(`/${bedrock == "true" ? "bedrock/" : ""}${server}`);
}

// ----------------------------- CATCH -----------------------------

export const CatchBoundary = withEmotionCache(({ children }: DocumentProps, emotionCache) => {
	const caught = useCatch();

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
				<ChakraProvider theme={theme} colorModeManager={localStorageManager}>
					<Flex h="100%" minH={"100vh"} bg={"radial-gradient(#5019a85e, transparent)"} px={4}>
						<VStack m="auto" spacing={5}>
							<Heading color={"red"}>{caught.status}</Heading>
							<Heading>{caught.status === 404 ? "Page not found" : caught.statusText}</Heading>
							<Stack direction={{ base: "column", sm: "row" }} spacing={5} w="100%">
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
				</ChakraProvider>
			</body>
		</html>
	);
});

// ----------------------------- ERROR -----------------------------

export const ErrorBoundary = withEmotionCache(({ error }: DocumentErrorProps, emotionCache) => {
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
				<ChakraProvider theme={theme}>
					<Flex h="100%" minH={"calc(100vh - 80px)"} px={4}>
						<VStack m="auto" spacing={5}>
							<Heading>Oops... Something unexpected has just happend</Heading>
							<Heading fontSize={"lg"}>
								Please try refreshing the page, if error still occurs please contact admin
							</Heading>
							<Heading color={"red"}>{error.name}</Heading>
							<Box as="pre">{error.message}</Box>
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
				</ChakraProvider>
			</body>
		</html>
	);
});
