import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { broadcastDevReady } from "@remix-run/node";
import type { AppLoadContext, ServerBuild } from "@remix-run/server-runtime";
import { createRequestHandler } from "@remix-run/server-runtime";
import cluster from "cluster";
import type { Context, Env, Input, MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { isIP } from "is-ip";
import * as fs from "node:fs";
import * as url from "node:url";
import os from "os";
import path from "path";
import sourceMapSupport from "source-map-support";

const BUILD_PATH = path.resolve("build/index.js");

(async () => {
	sourceMapSupport.install();

	const build = await reimportServer();

	const app = new Hono();

	app.use(async (ctx, next) => {
		ctx.res.headers.delete("x-powered-by");
		await next();
	});

	app.use("*", logger());

	app.use("*", cacheBuild());

	app.use(
		"/*",
		serveStatic({
			root: "./public"
		})
	);

	app.use("*", compress());

	app.use(
		"*",
		remix({
			build,
			mode: process.env.NODE_ENV as "development" | "production",
			getLoadContext: async () => {
				return {
					start: Date.now().toString()
				};
			}
		})
	);

	const port = process.env.NODE_ENV === "production" ? Number(process.env.PORT) || 3000 : Number(process.env.PORT_DEV) || 3000;

	if (cluster.isPrimary) {
		Logger(`Master ${process.pid} is running`, "magenta");

		for (let i = 0; i < os.cpus().length; i++) {
			cluster.fork();
		}

		cluster.on("exit", (worker) => {
			Logger(`Worker ${worker.process.pid} died`, "white", "red");
			cluster.fork();
		});
	} else {
		Logger(`Worker ${process.pid} started`, "blue");

		serve(
			{
				fetch: app.fetch,
				port
			},
			(info) => {
				Logger(`Blazingly fast Hono server listening on http://localhost:${info.port}`, "green");
				if (process.env.NODE_ENV === "development") {
					broadcastDevReady(build);
				}
			}
		);
	}
})();

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const CONFIG = {
	SYSTEM: {
		reset: "\x1b[0m",
		bold: "\x1b[1m",
		dim: "\x1b[2m",
		italic: "\x1b[3m",
		underscore: "\x1b[4m",
		reverse: "\x1b[7m",
		strikethrough: "\x1b[9m",
		backoneline: "\x1b[1A",
		cleanthisline: "\x1b[K"
	},
	FONT: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m"
	},
	BACKGROUND: {
		black: "\x1b[40m",
		red: "\x1b[41m",
		green: "\x1b[42m",
		yellow: "\x1b[43m",
		blue: "\x1b[44m",
		magenta: "\x1b[45m",
		cyan: "\x1b[46m",
		white: "\x1b[47m"
	}
} as const;

export function Logger(
	text: string | string[],
	color: keyof typeof CONFIG.FONT = "black",
	bg?: keyof typeof CONFIG.BACKGROUND
): void {
	console.log(
		`[${new Date().toLocaleTimeString()}]`,
		`${CONFIG.SYSTEM.bold}${CONFIG.FONT[color]}${bg ? CONFIG.BACKGROUND[bg] : ""}`,
		Array.isArray(text) ? text.join(", ") : text,
		`${CONFIG.SYSTEM.reset}`
	);
}

interface RemixMiddlewareOptions<
	E extends Env = Record<string, never>,
	P extends string = "",
	I extends Input = Record<string, never>
> {
	build: ServerBuild;
	mode?: "development" | "production";
	getLoadContext?(event: Context<E, P, I>): Promise<AppLoadContext> | AppLoadContext;
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

// LOGGER

enum LogPrefix {
	Outgoing = "-->",
	Incoming = "<--",
	Error = "xxx"
}

function humanize(times: string[]) {
	const [delimiter, separator] = [",", "."];

	const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));

	return orderTimes.join(separator);
}

function time(start: number) {
	const delta = Date.now() - start;
	return humanize([delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s"]);
}

function colorStatus(status: number) {
	const out: { [key: string]: string } = {
		7: `\x1b[35m${status}\x1b[0m`,
		5: `\x1b[31m${status}\x1b[0m`,
		4: `\x1b[33m${status}\x1b[0m`,
		3: `\x1b[36m${status}\x1b[0m`,
		2: `\x1b[32m${status}\x1b[0m`,
		1: `\x1b[32m${status}\x1b[0m`,
		0: `\x1b[33m${status}\x1b[0m`
	};

	const calculateStatus = (status / 100) | 0;

	return out[calculateStatus];
}

type PrintFunc = (str: string, ...rest: string[]) => void;

function log(
	fn: PrintFunc,
	prefix: string,
	method: string,
	path: string,
	ip: string | null,
	status: number = 0,
	elapsed?: string
) {
	const out =
		prefix === LogPrefix.Incoming
			? `  ${prefix} ${method} ${path}`
			: `  ${prefix} ${method} ${ip ? `${ip} ` : ""}${path} ${colorStatus(status)} ${elapsed}`;
	fn(out);
}

function logger(fn: PrintFunc = console.log): MiddlewareHandler {
	return async (c, next) => {
		const path = new URL(c.req.url).pathname;
		const isBuild = path.startsWith("/build");
		if (isBuild) {
			return await next();
		}

		const { method } = c.req;
		const ip = getClientIPAddress(c.req.raw.headers);

		log(fn, LogPrefix.Incoming, method, path, ip);

		const start = Date.now();

		await next();

		log(fn, LogPrefix.Outgoing, method, path, ip, c.res.status, time(start));
	};
}

function cacheBuild(): MiddlewareHandler {
	return async (c, next) => {
		const path = new URL(c.req.url).pathname;
		const isBuild = path.startsWith("/build");
		if (isBuild) {
			const time = 60 * 60 * 24 * 365; // 1 year
			c.res.headers.set("cache-control", `public, max-age=${time}, immutable`);
		}

		await next();
	};
}

const headerNames = Object.freeze([
	"X-Client-IP",
	"X-Forwarded-For",
	"HTTP-X-Forwarded-For",
	"Fly-Client-IP",
	"CF-Connecting-IP",
	"Fastly-Client-Ip",
	"True-Client-Ip",
	"X-Real-IP",
	"X-Cluster-Client-IP",
	"X-Forwarded",
	"Forwarded-For",
	"Forwarded",
	"DO-Connecting-IP",
	"oxygen-buyer-ip"
] as const);

export function getClientIPAddress(headers: Headers): string | null {
	let ipAddress = headerNames
		.flatMap((headerName) => {
			let value = headers.get(headerName);
			if (headerName === "Forwarded") {
				return parseForwardedHeader(value);
			}
			if (!value?.includes(",")) return value;
			return value.split(",").map((ip) => ip.trim());
		})
		.find((ip) => {
			if (ip === null) return false;
			return isIP(ip);
		});

	return ipAddress ?? null;
}

function parseForwardedHeader(value: string | null): string | null {
	if (!value) return null;
	for (let part of value.split(";")) {
		if (part.startsWith("for=")) return part.slice(4);
		continue;
	}
	return null;
}

async function reimportServer() {
	const stat = fs.statSync(BUILD_PATH);

	// convert build path to URL for Windows compatibility with dynamic `import`
	const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

	// use a timestamp query parameter to bust the import cache
	return await import(BUILD_URL + "?t=" + stat.mtimeMs);
}
