import { Logger } from "@/.server/modules/Logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { AppLoadContext, ServerBuild } from "@remix-run/server-runtime";
import { createRequestHandler } from "@remix-run/server-runtime";
import type { Context, Env, Input, MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { compress } from "hono/compress";
import type { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as url from "node:url";
import path from "path";
import connectDatabases from "server/connect";
import { cache, customizeHeaders, logger } from "server/honomiddlewares";
import pack from "../package.json";

const isProd = process.env.NODE_ENV === "production";

const viteDevServer = isProd
	? undefined
	: await import("vite").then((vite) =>
			vite.createServer({
				server: { middlewareMode: true },
				appType: "custom"
			})
	  );

export class HonoApp extends Hono {
	constructor(emitter: EventEmitter) {
		super();

		this.use("*", customizeHeaders());
		this.use("*", compress());
		this.use(
			"/assets/*",
			cache(60 * 60 * 24 * 365), // 1 year
			serveStatic({ root: "./build/client" })
		);
		this.use(
			"/*",
			serveStatic({
				root: isProd ? "./public" : "./"
			})
		);
		this.use("*", logger());

		const build = viteDevServer
			? (viteDevServer.ssrLoadModule("virtual:remix/server-build") as Promise<ServerBuild>)
			: reimportServer();

		this.use(
			"*",
			remix({
				build: () => build,
				mode: process.env.NODE_ENV as "development" | "production",
				getLoadContext: () => {
					return {
						start: Date.now().toString(),
						repoVersion: "",
						version: pack.version,
						emitter
					};
				}
			})
		);
	}

	public async run() {
		const port = Number(process.env.PORT) || 3000;

		await connectDatabases();

		serve(
			{
				fetch: this.fetch,
				port
			},
			(info) => {
				Logger(`Worker ${process.pid} started server at http://localhost:${info.port}`, "green", "black");
			}
		);

		return this;
	}
}

const BUILD_PATH = path.resolve("build/server/index.js");

async function reimportServer() {
	const stat = fs.statSync(BUILD_PATH);

	const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

	return (await import(BUILD_URL + "?t=" + stat.mtimeMs)) as Promise<ServerBuild>;
}

function remix<E extends Env = Record<string, never>, P extends string = "", I extends Input = Record<string, never>>({
	mode,
	build,
	getLoadContext = () => ({} as unknown as AppLoadContext)
}: RemixMiddlewareOptions<E, P, I>): MiddlewareHandler {
	return async function middleware(context, next) {
		const requestHandler = createRequestHandler(build, mode);
		const loadContext = getLoadContext(context);
		return requestHandler(context.req.raw, loadContext instanceof Promise ? await loadContext : loadContext);
	};
}

interface RemixMiddlewareOptions<
	E extends Env = Record<string, never>,
	P extends string = "",
	I extends Input = Record<string, never>
> {
	build: ServerBuild | (() => Promise<ServerBuild>);
	mode?: "development" | "production";
	getLoadContext?(event: Context<E, P, I>): Promise<AppLoadContext> | AppLoadContext;
}
