import { generateRobotsTxt } from "@balavishnuvj/remix-seo";
import { type EntryContext } from "@remix-run/node";
import { db } from "~/components/server/db/db.server";

type Handler = (request: Request, remixContext: EntryContext) => Promise<Response | null> | null;

export const otherRootRoutes: Record<string, Handler> = {
	"/sitemap.xml": async (request, remixContext) => {
		const servers = await db.server.findMany({
			select: {
				server: true
			}
		});

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
		${servers.map((server) => {
			return `		<url>
			<loc>https://ismcserver.online/${server.server.toLowerCase()}</loc>
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
		return generateRobotsTxt([{ type: "sitemap", value: "https://ismcserver.online/sitemap.xml" }]);
	}
};

export const otherRootRouteHandlers: Array<Handler> = [
	...Object.entries(otherRootRoutes).map(([path, handler]) => {
		return (request: Request, remixContext: EntryContext) => {
			if (new URL(request.url).pathname !== path) return null;
			return handler(request, remixContext);
		};
	})
];
