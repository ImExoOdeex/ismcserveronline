import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		remix({
			ignoredRouteFiles: ["**/.*"],
			manifest: true,
			future: {
				v3_throwAbortReason: true,
				v3_fetcherPersist: true
			}
		}),
		tsconfigPaths()
	],
	ssr: {
		noExternal: [/^react-icons.*/, /^remix-utils.*/, "intl-parse-accept-language", "is-ip", "dayjs/plugin/relativeTime"]
	}
});
