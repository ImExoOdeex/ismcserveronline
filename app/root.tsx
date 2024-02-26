import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { validateServer } from "@/.server/functions/validateServer";
import { getCookieWithoutDocument } from "@/functions/cookies";
import Layout from "@/layout/global/Layout";
import { GlobalContext } from "@/utils/GlobalContext";
import useTheme from "@/utils/theme";
import { ChakraBaseProvider, cookieStorageManagerSSR, useConst } from "@chakra-ui/react";
import { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useLocation, useOutlet } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { isbot } from "isbot";
import { useMemo } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { getClientLocales } from "remix-utils/locales/server";
import { Document } from "./document";

// ----------------------------- META -----------------------------

export function meta() {
	const desc =
		"Check Minecraft server status and data by real-time. Supports Status, Legacy & Query protocols with no cached results.";

	return [
		{
			name: "robots",
			content: "all"
		},
		{
			name: "description",
			content: desc
		},
		// og tags
		{
			property: "og:description",
			content: desc
		},
		{
			property: "og:image",
			content: "https://ismcserver.online/webp/statusbotlogo512.webp"
		},
		{
			property: "og:url",
			content: "https://ismcserver.online/"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "keywords",
			content:
				"Minecraft server check, Server status check, Minecraft server status, Online server status, Minecraft server monitor, Server checker tool, Minecraft server checker, Real-time server status, Minecraft server status checker, Server uptime checker, Minecraft server monitor tool, Minecraft server status monitor, Real-time server monitoring, Server availability checker, Minecraft server uptime checker"
		},
		{
			charSet: "utf-8"
		},
		{
			name: "viewport",
			content: "width=device-width,initial-scale=1"
		},
		{
			name: "author",
			content: "imexoodeex"
		}
	] as ReturnType<MetaFunction>;
}

// ----------------------------- LINKS -----------------------------

export function links() {
	return [
		{ rel: "preconnect", href: "https://fonts.googleapis.com" },
		{
			rel: "preconnect",
			href: "https://fonts.gstatic.com",
			crossOrigin: "anonymous"
		},
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=block"
		},
		{
			rel: "preload",
			href: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
			as: "font",
			type: "font/woff2",
			crossOrigin: "anonymous"
		},
		{
			rel: "icon",
			type: "image/png",
			href: "/favicon.ico",
			sizes: "20x20"
		}
	] as ReturnType<LinksFunction>;
}

// ----------------------------- APP -----------------------------

export default function App() {
	return (
		<Document>
			<GlobalContext>
				<InsideGlobal />
			</GlobalContext>
		</Document>
	);
}

function InsideGlobal() {
	const { cookies } = useTypedLoaderData<typeof loader>();
	const cookieManager = useConst(cookieStorageManagerSSR(cookies));
	const path = useLocation().pathname;
	const outlet = useOutlet();
	const customTheme = useTheme();

	const animationKey = useMemo(() => {
		const isDash = path.startsWith("/dashboard");
		const panelRoutesRegex = /\/(?:bedrock\/)?[^\/]+\/panel(?:\/.*)?/;
		const isPanel = panelRoutesRegex.test(path);

		return isDash ? "dashboard" : isPanel ? "panel" : path;
	}, [path]);

	return (
		<ChakraBaseProvider
			resetCSS
			toastOptions={{
				defaultOptions: {
					duration: 5000,
					isClosable: true,
					position: "bottom-right",
					variant: "subtle",
					status: "success"
				}
			}}
			theme={customTheme}
			colorModeManager={cookieManager}
		>
			<Layout>
				<AnimatePresence initial={false} mode={"popLayout"}>
					<motion.main
						key={animationKey}
						initial={{
							opacity: 0,
							scale: 0.95
						}}
						animate={{
							opacity: 1,
							scale: 1
						}}
						exit={{
							opacity: 0,
							scale: 0.95
						}}
						transition={{
							ease: [0.25, 0.1, 0.25, 1],
							duration: 0.2
						}}
						style={{
							overflow: "hidden",
							display: "flex",
							flexDirection: "column",
							flex: 1
						}}
					>
						{outlet}
					</motion.main>
				</AnimatePresence>
			</Layout>
		</ChakraBaseProvider>
	);
}

// ----------------------------- LOADER -----------------------------

export async function loader({ request, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const term = url.searchParams.get(requireEnv("NO_ADS_PARAM_NAME"));

	const shouldRedirect: boolean = term === requireEnv("NO_ADS_PARAM_VALUE");
	if (shouldRedirect) {
		throw redirect(url.pathname, {
			headers: {
				"Set-Cookie": `no_ads=${requireEnv("NO_ADS_PARAM_VALUE")}; Path=/; Max-Age=31536000;`
			}
		});
	}

	const user = await getUser(request);

	const showAds = user?.everPurchased
		? false
		: getCookieWithoutDocument("no_ads", request.headers.get("cookie") ?? "") !== requireEnv("NO_ADS_PARAM_VALUE");
	// ^^^ code for no ads up there uwu ^^^

	const isBot = isbot(request.headers.get("user-agent"));
	const start = Number(context.start ?? Date.now());
	const locales = getClientLocales(request);

	return typedjson({
		cookies: request.headers.get("cookie") ?? "",
		showAds,
		user,
		dashUrl: requireEnv("REDIRECT_URL"),
		isBot,
		locales,
		version: (context?.version as string | undefined) ?? "v3",
		repoVersion: (context?.repoVersion as string | undefined) ?? "",
		timings: {
			start
		}
	});
}

export function shouldRevalidate({ nextUrl }: ShouldRevalidateFunctionArgs) {
	if (nextUrl.pathname === "/login") return true;
	if (nextUrl.pathname === "/") return true;
	return false;
}

// ----------------------------- ACTION -----------------------------

export async function action({ request }: ActionFunctionArgs) {
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

// ----------------------------- ERROR -----------------------------

export { ErrorBoundary } from "./document";
