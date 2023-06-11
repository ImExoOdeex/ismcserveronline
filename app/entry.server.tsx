import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import type { EntryContext } from "@remix-run/node"; // Depends on the runtime you choose
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { ServerStyleContext } from "./context";
import createEmotionCache from "./createEmotionCache";
import { otherRootRouteHandlers } from "./routes/otherRootRoutes.server";

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	const cache = createEmotionCache();
	const { extractCriticalToChunks } = createEmotionServer(cache);

	const html = renderToString(
		<ServerStyleContext.Provider value={null}>
			<CacheProvider value={cache}>
				<RemixServer context={remixContext} url={request.url} />
			</CacheProvider>
		</ServerStyleContext.Provider>
	);

	const chunks = extractCriticalToChunks(html);

	for (const handler of otherRootRouteHandlers) {
		const otherRouteResponse = await handler(request, remixContext);
		if (otherRouteResponse) return otherRouteResponse;
	}

	const markup = renderToString(
		<ServerStyleContext.Provider value={chunks.styles}>
			<CacheProvider value={cache}>
				<RemixServer context={remixContext} url={request.url} />
			</CacheProvider>
		</ServerStyleContext.Provider>
	);

	responseHeaders.set("Content-Type", "text/html");

	return new Response(`<!DOCTYPE html>${markup}`, {
		status: responseStatusCode,
		headers: responseHeaders
	});
}
