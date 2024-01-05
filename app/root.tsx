import { ChakraBaseProvider, cookieStorageManagerSSR, localStorageManager, useConst, usePrevious } from "@chakra-ui/react";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useLocation, useOutlet } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import Layout from "./components/layout/Layout";
import { getUser } from "./components/server/db/models/user";
import { validateServer } from "./components/server/functions/validateServer";
import { GlobalContext } from "./components/utils/GlobalContext";
import { getCookieWithoutDocument } from "./components/utils/functions/cookies";
import useTheme from "./components/utils/theme";
import { Document } from "./document";

// ----------------------------- META -----------------------------

export function meta() {
	return [
		{
			name: "robots",
			content: "all"
		},
		{
			name: "description",
			content: "Check Minecraft server status and data by real-time."
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
			content: ".imexoodeex#0528"
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
			href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Outfit:wght@700;800;900&family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap"
		}
	];
}

// ----------------------------- APP -----------------------------

export default function App() {
	const { cookies } = useTypedLoaderData<typeof loader>();
	const cookieManager = useConst(cookieStorageManagerSSR(cookies));
	const location = useLocation();
	const outlet = useOutlet();

	const prevPath = usePrevious(location.pathname);
	const isDash = location.pathname.startsWith("/dashboard");

	const shouldntAnimate = prevPath?.startsWith("/dashboard") && isDash;

	const customTheme = useTheme();

	return (
		<Document>
			<ChakraBaseProvider
				resetCSS
				theme={customTheme}
				colorModeManager={typeof cookies === "string" ? cookieManager : localStorageManager}
			>
				<GlobalContext>
					<Layout>
						{shouldntAnimate ? (
							outlet
						) : (
							<AnimatePresence initial={false} mode={"popLayout"}>
								<motion.main
									key={location.pathname}
									initial={{
										opacity: 0,
										scale: 1.1
									}}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{
										opacity: 0,
										scale: 0.9
									}}
									transition={{
										ease: [0.25, 0.1, 0.25, 1],
										duration: 0.2
									}}
								>
									{outlet}
								</motion.main>
							</AnimatePresence>
						)}
					</Layout>
				</GlobalContext>
			</ChakraBaseProvider>
		</Document>
	);
}

// ----------------------------- LOADER -----------------------------

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const term = url.searchParams.get(process.env.NO_ADS_PARAM_NAME ?? "nope");

	const shouldRedirect: boolean = term?.toString() === process.env.NO_ADS_PARAM_VALUE;
	if (shouldRedirect) {
		throw redirect(url.pathname, {
			headers: [["Set-Cookie", `no_ads=${process.env.NO_ADS_PARAM_VALUE}`]]
		});
	}

	const user = await getUser(request);

	const showAds = user?.everPurchased
		? false
		: getCookieWithoutDocument("no_ads", request.headers.get("cookie") ?? "") !== process.env.NO_ADS_PARAM_VALUE;
	// ^^^ code for no ads up there uwu ^^^

	return typedjson({
		cookies: request.headers.get("cookie") ?? "",
		showAds,
		user,
		dashUrl: process.env.DASH_URL
	});
}

export function shouldRevalidate({ nextUrl }: ShouldRevalidateFunctionArgs) {
	if (nextUrl.pathname === "/login") return true;
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
