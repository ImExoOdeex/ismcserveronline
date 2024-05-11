import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { addressesConfig } from "@/.server/functions/validateServer";
import serverConfig from "@/.server/serverConfig";
import { getCookieWithoutDocument } from "@/functions/cookies";
import Layout from "@/layout/global/Layout";
import { GlobalContext } from "@/utils/GlobalContext";
import config from "@/utils/config";
import useTheme from "@/utils/theme";
import { ChakraBaseProvider, cookieStorageManagerSSR, useConst } from "@chakra-ui/react";
import type {
    ActionFunctionArgs,
    LinksFunction,
    LoaderFunctionArgs,
    MetaArgs,
    MetaFunction
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useLocation, useOutlet } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { isbot } from "isbot";
import { useMemo } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { getClientLocales } from "remix-utils/locales/server";
import { Document } from "./document";

// ----------------------------- META -----------------------------

export function meta({ params }: MetaArgs) {
    const desc =
        "Minecraft server list & status checker. Vote and Check any Minecraft server status in real-time. Get detailed server information, vote for your favorite server, and more.";

    const shouldSkipDefaultOgTags = "server" in params;

    return [
        {
            charSet: "utf-8"
        },
        {
            name: "robots",
            content: "all"
        },
        {
            name: "description",
            content: desc
        },
        {
            name: "image",
            content: `${config.dashUrl}/logo-wallpaper.png`
        },
        // og tags
        ...(shouldSkipDefaultOgTags
            ? []
            : [
                  {
                      property: "og:title",
                      content: "#1 Minecraft server list & status checker"
                  },
                  {
                      property: "og:description",
                      content: desc
                  },
                  {
                      property: "og:image",
                      content: `${config.dashUrl}/logo-wallpaper.png`
                  },
                  // set sizes for image
                  {
                      property: "og:image:width",
                      content: "3840"
                  },
                  {
                      property: "og:image:height",
                      content: "2160"
                  },
                  {
                      property: "og:url",
                      content: config.dashUrl
                  },
                  {
                      property: "og:site_name",
                      content: "Minecraft server list & status checker"
                  }
              ]),
        {
            property: "og:type",
            content: "website"
        },
        {
            name: "keywords",
            content:
                "Minecraft server status, Minecraft server checker, Real-time server status, Minecraft server list, Best Minecraft server list, Minecraft best servers, Minecraft server data, Minecraft server info, Minecraft top server list"
        },
        {
            name: "viewport",
            content: "width=device-width,initial-scale=1"
        },
        {
            name: "author",
            content: "imexoodeex"
        },
        // pwa
        {
            name: "theme-color",
            content: "#563B9F"
        },
        {
            name: "apple-mobile-web-app-capable",
            content: "yes"
        },
        {
            name: "apple-mobile-web-app-status-bar-style",
            content: "black"
        },
        {
            name: "apple-mobile-web-app-title",
            content: "IsMcServer.online"
        },
        {
            name: "application-name",
            content: "IsMcServer.online"
        },
        {
            name: "msapplication-TileColor",
            content: "#563B9F"
        },

        // twitter
        {
            name: "twitter:card",
            content: "summary_large_image"
        },
        {
            name: "twitter:site",
            content: "@imcserveronline"
        },
        {
            name: "twitter:creator",
            content: "@imcserveronline"
        },
        {
            name: "twitter:title",
            content: "#1 Minecraft server list & status checker"
        },
        {
            name: "twitter:description",
            content: desc
        },
        {
            name: "twitter:image",
            content: `${config.dashUrl}/logo-wallpaper.png`
        },
        {
            name: "twitter:url",
            content: config.dashUrl
        },
        {
            name: "twitter:domain",
            content: config.dashUrl
        }
    ] as ReturnType<MetaFunction>;
}

// ----------------------------- LINKS -----------------------------

export function links() {
    return [
        {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossOrigin: "anonymous"
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
        },
        {
            rel: "manifest",
            href: "/manifest.json"
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
                            opacity: 0
                            // scale: 0.95
                        }}
                        animate={{
                            opacity: 1
                            // scale: 1
                        }}
                        exit={{
                            opacity: 0
                            // scale: 0.95
                        }}
                        transition={{
                            ease: config.ease,
                            duration: 0.15
                        }}
                        style={{
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            zIndex: 1
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
    const user = await getUser(request);

    const isBot = isbot(request.headers.get("user-agent"));

    const start = Number(context.start ?? Date.now());
    const locales = getClientLocales(request);

    return typedjson({
        cookies: request.headers.get("cookie") ?? "",
        user,
        dashUrl: serverConfig.redirectUrl,
        isBot,
        discordClient: requireEnv("DISCORD_CLIENT_ID"),
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
    const bedrock =
        getCookieWithoutDocument("version", request.headers.get("Cookie") ?? "") === "bedrock";

    const server = formData.get("server")?.toString().toLowerCase().trim();

    if (!server) {
        return null;
    }

    if (addressesConfig.isValidServerAddress(server)) {
        return redirect(`/${bedrock ? "bedrock/" : ""}${server}`);
    }
    return redirect("/search?q=" + server);
}

// ----------------------------- ERROR -----------------------------

export { ErrorBoundary } from "./document";
