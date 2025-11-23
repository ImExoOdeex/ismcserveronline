import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: ["./server/server.ts", "./server/ExpressApp.ts"],
          output: {
            entryFileNames: "[name].js",
            format: "esm",
          },
        }
      : undefined,
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      manifest: true,
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: [
      /^react-icons.*/,
      /^remix-utils.*/,
      "intl-parse-accept-language",
      "is-ip",
      "dayjs/plugin/relativeTime",
      "react-markdown",
      "remark-breaks",
      "remark-gfm",
    ],
  },
}));
