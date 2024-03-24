import { PrismaClient } from "@prisma/client";
import type { GetLoadContextFunction } from "@remix-run/express";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { WsServer } from "server/wsserver";
import sourceMapSupport from "source-map-support";
import pack from "../package.json";

(async () => {
	sourceMapSupport.install();
	installGlobals();

	new WsServer(new PrismaClient());

	const BUILD_PATH = path.resolve("build/server/index.js");
	// const VERSION_PATH = path.resolve("version.txt");
	// const repoVersion = fs.readFileSync(VERSION_PATH, "utf-8").trim();

	const initialBuild = await reimportServer();

	const getLoadContext: GetLoadContextFunction = () => {
		return {
			start: Date.now().toString(),
			repoVersion: "",
			version: pack.version
		};
	};

	const viteDevServer =
		process.env.NODE_ENV === "production"
			? undefined
			: await import("vite").then((vite) =>
					vite.createServer({
						server: { middlewareMode: true }
					})
			  );

	const remixHandler = createRequestHandler({
		build: viteDevServer ? async () => viteDevServer.ssrLoadModule("virtual:remix/server-build") : await reimportServer(),
		mode: initialBuild.mode,
		getLoadContext
	});

	const app = express();

	app.use(compression());

	// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
	app.disable("x-powered-by");

	if (viteDevServer) {
		app.use(viteDevServer.middlewares);
	} else {
		// Remix fingerprints its assets so we can cache forever.
		app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));

		// Everything else (like favicon.ico) is cached for an hour. You may want to be
		// more aggressive with this caching.
		app.use(express.static("public", { maxAge: "1h" }));
	}

	app.use(morgan("tiny"));

	app.all("*", remixHandler);

	const port = process.env.PORT || 3000;

	app.listen(port, async () => {
		console.log(`Express server listening on port ${port}`);
	});

	/**
	 * @returns {Promise<ServerBuild>}
	 */
	async function reimportServer() {
		const stat = fs.statSync(BUILD_PATH);

		// convert build path to URL for Windows compatibility with dynamic `import`
		const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

		// use a timestamp query parameter to bust the import cache
		return await import(BUILD_URL + "?t=" + stat.mtimeMs);
	}
})();
