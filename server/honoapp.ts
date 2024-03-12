import { Logger } from "@/.server/modules/Logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { AppLoadContext, ServerBuild } from "@remix-run/server-runtime";
import { createRequestHandler } from "@remix-run/server-runtime";
import type { Context, Env, Input, MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { compress } from "hono/compress";
import * as fs from "node:fs";
import * as url from "node:url";
import path from "path";
import { RedisInstance } from "server/databases/redis";
import { cache, customizeHeaders, logger } from "server/honomiddlewares";
import pack from "../package.json";

const viteDevServer =
	process.env.NODE_ENV === "production"
		? undefined
		: await import("vite").then((vite) =>
				vite.createServer({
					server: { middlewareMode: true }
				})
		  );

export class HonoApp extends Hono {
	constructor() {
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
				root: "./build/client"
			})
		);
		this.use("*", logger());

		this.use(
			"*",
			remix({
				build: viteDevServer
					? () => viteDevServer.ssrLoadModule("virtual:remix/server-build") as unknown as Promise<ServerBuild>
					: () => reimportServer(),
				mode: process.env.NODE_ENV as "development" | "production",
				getLoadContext: async () => {
					return {
						start: Date.now().toString(),
						repoVersion: "",
						version: pack.version
					};
				}
			})
		);
	}

	public async run() {
		const port = Number(process.env.PORT) || 3000;

		// connecting to databases
		const redis = new RedisInstance();
		await redis.connect().then(() => {
			Logger(`Worker ${process.pid} Connected to the redis`, "green", "black");
		});
		global.__redis = redis;

		const db = await import("server/databases/postgresql").then((m) => new m.PrismaClientWithCache());
		await db.$connect().then(() => {
			Logger(`Worker ${process.pid} Connected to the database`, "green", "black");
		});
		global.__db = db;

		serve(
			{
				fetch: this.fetch,
				port
			},
			(info) => {
				Logger(`Worker ${process.pid} started server at http://localhost:${info.port}`, "green", "black");
			}
		);
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
	return async function middleware(context) {
		const requestHandler = createRequestHandler(build, mode);
		const loadContext = getLoadContext(context);
		return await requestHandler(context.req.raw, loadContext instanceof Promise ? await loadContext : loadContext);
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
