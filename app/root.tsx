import { ChakraProvider, cookieStorageManagerSSR, localStorageManager, useConst } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { type ActionArgs, json, redirect, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useOutlet,
  useTransition,
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect } from "react";
import Layout from "./components/layout/Layout";
import theme from "./components/utils/theme";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { type LinksFunction } from "@remix-run/react/dist/routeModules";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css";
import { getCookieWithoutDocument } from "./components/utils/func/cookiesFunc";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "IsMcServer.online",
  viewport: "width=device-width,initial-scale=1",
  description: "Check Minecraft server status and data by real-time."
});

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    const { cookies } = useLoaderData<typeof loader>()
    const themeValue = getCookieWithoutDocument("chakra-ui-color-mode", cookies)

    useEffect(() => {
      emotionCache.sheet.container = document.head;
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      clientStyleData?.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en" style={{ colorScheme: themeValue }} data-theme={themeValue}>
        <head>
          <meta name="robots" content="all" />
          <Meta />
          <link rel="icon" type="image/png" href="/favicon.png" sizes="48x48" />
          {/* <!-- Google Tag Manager --> */}
          <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WW2Z3RZ');`}}></script>
          {/* <!-- End Google Tag Manager --> */}
          {/* <!-- Google tag (gtag.js) --> */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-F1BWR503G2"></script>
          <script dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F1BWR503G2');`}}>
          </script>
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(' ')}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {/* <!-- Google Tag Manager (noscript) --> */}
          <noscript><iframe title="Google Tag Manager" src="https://www.googletagmanager.com/ns.html?id=GTM-WW2Z3RZ"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
          {/* <!-- End Google Tag Manager (noscript) --> */}
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" },
    { rel: "stylesheet", href: nProgressStyles }
  ];
};

export default function App() {
  const { cookies } = useLoaderData()
  const cookieManager = useConst(cookieStorageManagerSSR(cookies));
  const location = useLocation()
  const outlet = useOutlet()

  const transition = useTransition();
  NProgress.configure({ showSpinner: false, trickle: true, trickleSpeed: 200, speed: 200, minimum: .25 })
  useEffect(() => {
    if (transition.state === "idle") NProgress.done();
    else NProgress.start();
  }, [transition.state]);

  return (
    <Document>
      <ChakraProvider resetCSS theme={theme} colorModeManager={typeof cookies === 'string'
        ? cookieManager
        : localStorageManager
      }>
        <Layout>
          <AnimatePresence initial={false} mode='wait'>
            <motion.main key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: .1125 }}
            >
              {outlet}
            </motion.main>
          </AnimatePresence>
        </Layout>
      </ChakraProvider>
    </Document>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  return json({ cookies: request.headers.get("cookie") ?? '' })
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const bedrock = formData.get("bedrock")
  const server = formData.get("server")?.toString().toLowerCase()

  return redirect(`/${bedrock == "true" ? "bedrock/" : ""}${server}`)
};