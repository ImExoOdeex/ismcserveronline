import { builtinModules } from 'module';
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["server/server.ts", "server/ExpressApp.ts"],
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: true,
    outDir: "build/server",
    target: "node22",
    format: "esm",
    banner: {
        js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
    },
    // outExtension: () => ({ js: ".js" }),
    external: ["virtual:remix/server-build", "fs", "lightningcss", "react", "dotenv", "node:*", ...builtinModules],
    noExternal: ["@remix-run/serve", "hono", "isbot", "@remix-run/node"]
});
