import type { MiddlewareHandler } from "hono";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

// headers
export function customizeHeaders(): MiddlewareHandler {
	return async (ctx, next) => {
		ctx.res.headers.delete("x-powered-by");
		ctx.res.headers.set("x-coffee-is", "yummy");
		await next();
	};
}

// cache build
export function cache(seconds: number): MiddlewareHandler {
	return async (c, next) => {
		await next();

		if (!c.res.ok) {
			return;
		}

		c.res.headers.set("cache-control", `public, max-age=${seconds}`);
	};
}

// logger
type PrintFunc = (str: string, ...rest: string[]) => void;

enum LogPrefix {
	Outgoing = "-->",
	Incoming = "<--",
	Error = "xxx"
}

export function logger(fn: PrintFunc = console.log): MiddlewareHandler {
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
}
