import { getCache, setCache } from "@/.server/db/redis";
import { notAllowedEndings } from "@/.server/functions/validateServer";
import config from "@/utils/config";
import { json, redirectDocument, type EntryContext } from "@remix-run/node";
import { db } from "./db/db";

type Handler = (request: Request, remixContext: EntryContext) => Promise<Response | null> | null;

const redirects = [
	{
		from: ["/discord", "/support"],
		to: config.discordServerInvite
	},
	{
		from: ["/invite", "/bot"],
		to: config.discordBotInvite
	},
	{
		from: ["/status"],
		to: "https://status.ismcserver.online"
	},
	{
		from: ["/docs", "/documentation", "/api/docs", "/api"],
		to: "/api/documentation"
	}
];

export const otherRootRoutes: Record<string, Handler> = {
	"/sitemap.xml": async () => {
		const cache = await getCache("sitemap");
		if (cache) {
			return new Response(cache, {
				headers: {
					"Content-Type": "application/xml",
					"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
				}
			});
		}

		const serversArr = await db.server.findMany({
			select: {
				server: true,
				bedrock: true
			},
			where: {
				online: true
			}
		});
		type Server = (typeof serversArr)[number];

		const filtered = new Set(serversArr);

		// remove long urls from filtered
		const longUrls = new Set<Server>();
		for (const check of filtered) {
			if (check.server.length > 50) {
				longUrls.add(check);
			}
		}
		for (const longUrl of longUrls) {
			filtered.delete(longUrl);
		}

		// remove urls that are ip addresses
		const ipAddresses = new Set<Server>();
		for (const check of filtered) {
			const ipRegexWithPortOptional = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?$/;
			if (ipRegexWithPortOptional.test(check.server)) {
				ipAddresses.add(check);
			}
		}
		for (const ipAddress of ipAddresses) {
			filtered.delete(ipAddress);
		}

		// remove addresses that end with not allowed endings
		const notAllowedEndingsUrls = new Set<Server>();
		for (const check of filtered) {
			const hasEnding = notAllowedEndings.some((ending) => check.server.endsWith(ending));
			if (hasEnding) {
				notAllowedEndingsUrls.add(check);
			}
		}

		for (const notAllowedEndingUrl of notAllowedEndingsUrls) {
			filtered.delete(notAllowedEndingUrl);
		}

		const data = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
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

		${[...filtered].map((check) => {
			return `		<url>
			<loc>https://ismcserver.online/${check.server.toLowerCase()}/vote</loc>
			<priority>0.5</priority>
			</url>`;
		})}
		
		</urlset>`;

		await setCache("sitemap", data, 86400);

		return new Response(data, {
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=86400"
			}
		});
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
	"/manifest.json": async () => {
		const mainImage = "/webp/statusbotlogo512.webp";
		// const mainImagePng = "/webp/statusbotlogo512.png";

		return json(
			{
				name: "IsMcServer.online",
				short_name: "ismcserver.online",
				description: "Check Minecraft server status and data by real-time. #1 Minecraft server list & status checker.",
				scope: "/",
				start_url: "/",
				form_factor: "wide",
				display: "standalone",
				background_color: "#18191c",
				theme_color: "#18191c",
				orientation: "portrait-primary",
				icons: [
					{
						src: mainImage,
						type: "image/png",
						sizes: "144x144"
					},
					{
						src: mainImage,
						type: "image/png",
						sizes: "64x64"
					},
					{
						src: mainImage,
						type: "image/png",
						sizes: "192x192"
					},
					{
						src: mainImage,
						type: "image/png",
						sizes: "256x256"
					},
					{
						src: mainImage,
						type: "image/png",
						sizes: "512x512",
						purpose: "any maskable"
					}
				]
			},

			{
				headers: {
					"Cache-Control": "public, max-age=86400"
				}
			}
		);
	},
	...redirects
		.flatMap(({ from, to }) => {
			return from.map((path) => {
				return {
					[path]: async () => {
						return redirectDocument(to);
					}
				};
			});
		})
		.reduce((acc, curr) => ({ ...acc, ...curr }), {})
};

export const otherRootRouteHandlers = [
	...Object.entries(otherRootRoutes).map(([path, handler]) => {
		return (request: Request, remixContext: EntryContext) => {
			if (new URL(request.url).pathname !== path) return null;
			return handler(request, remixContext);
		};
	})
] satisfies Handler[];
