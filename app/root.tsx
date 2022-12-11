import { ChakraProvider, cookieStorageManagerSSR, localStorageManager, useConst } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useOutlet,
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect } from "react";
import Layout from "./components/layout/Layout";
import theme from "./components/utils/theme";
import { ClientStyleContext, ServerStyleContext } from "./context";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "",
  viewport: "width=device-width,initial-scale=1",
});

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

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
      <html lang="en">
        <head>
          <Meta />
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
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

export default function App() {
  const { cookies } = useLoaderData()
  const cookieManager = useConst(cookieStorageManagerSSR(cookies));
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <Document>
      <ChakraProvider resetCSS theme={theme} colorModeManager={typeof cookies === 'string'
        ? cookieManager
        : localStorageManager
      }>
        <Layout>
          <AnimatePresence initial={false} mode='wait'>
            <motion.main key={location.pathname}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: .2 }}
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