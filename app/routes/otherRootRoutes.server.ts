import { redirect, type EntryContext } from "@remix-run/node";
import config from "~/components/config/config";
import { db } from "~/components/server/db/db.server";

type Handler = (request: Request, remixContext: EntryContext) => Promise<Response | null> | null;

export const otherRootRoutes: Record<string, Handler> = {
	"/sitemap.xml": async () => {
		const [servers, checks] = await Promise.all([
			db.server.findMany({
				select: {
					server: true
				}
			}),
			db.check.findMany({
				select: {
					server: true,
					online: true
				}
			})
		]);

		// delete duplicate servers
		const seen = new Set();
		const filteredServers = servers.filter((server) => {
			const duplicate = seen.has(server.server);
			seen.add(server.server);
			return !duplicate;
		});
		const filteredChecks = checks.filter((check) => {
			const duplicate = seen.has(check.server);
			seen.add(check.server);

			// filter only addresses that are not ips, but valid domains
			const isValidAddress = check.server.match(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/);

			return !duplicate && isValidAddress && check.online;
		});

		const filtered = new Set(filteredServers.concat(filteredChecks));

		// remove long urls from filtered
		const longUrls = new Set<{ server: string }>();
		for (const check of filtered) {
			if (check.server.length > 50) {
				longUrls.add(check);
			}
		}
		for (const longUrl of longUrls) {
			filtered.delete(longUrl);
		}

		return new Response(
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
		<url>
		<loc>https://ismcserver.online/popular-servers</loc>
		<priority>0.8</priority>
		</url>
		<url>
		<loc>https://ismcserver.online/dashboard</loc>
		<priority>0.7</priority>
		</url>
		<url>
		<loc>https://ismcserver.online</loc>
		<priority>1</priority>
		</url>
		<url>
		<loc>https://ismcserver.online/login</loc>
		<priority>0.7</priority>
		</url>
		<url>
		<loc>https://ismcserver.online/api</loc>
		<priority>0.8</priority>
		</url>
		<url>
		<loc>https://ismcserver.online/faq</loc>
		<priority>0.8</priority>
		</url>
		<url>
		<loc>https://ismcserver.online/tos</loc>
		<priority>0.7</priority>
		</url>
	
		${[...filtered].map((check) => {
			return `		<url>
			<loc>https://ismcserver.online/${check.server.toLowerCase()}</loc>
			<priority>0.5</priority>
			</url>`;
		})}
		</urlset>`,
			{
				headers: {
					"Content-Type": "application/xml",
					"Cache-Control": "public, max-age=86400"
				}
			}
		);
	},
	"/robots.txt": async () => {
		return new Response(
			`User-agent: *
			Allow: /
			Sitemap: https://ismcserver.online/sitemap.xml`,
			{
				headers: {
					"Content-Type": "text/plain",
					"Cache-Control": "public, max-age=86400"
				}
			}
		);
	},
	"/discord": async () => {
		return redirect(config.discordServerInvite);
	},
	"/support": async () => {
		return redirect(config.discordServerInvite);
	},
	"/invite": async () => {
		return redirect(config.discordBotInvite);
	},
	"/bot": async () => {
		return redirect(config.discordBotInvite);
	}
};

export const otherRootRouteHandlers: Handler[] = [
	...Object.entries(otherRootRoutes).map(([path, handler]) => {
		return (request: Request, remixContext: EntryContext) => {
			if (new URL(request.url).pathname !== path) return null;
			return handler(request, remixContext);
		};
	})
];
