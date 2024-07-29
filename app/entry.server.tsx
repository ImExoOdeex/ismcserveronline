import { otherRootRouteHandlers } from "@/.server/otherRootRoutes";
import { createEmotionCache } from "@/utils/ClientContext";
import { CacheProvider } from "@emotion/react";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";

const ABORT_DELAY = 7000;

// this will abort the request if it's not finished in {ABORT_DELAY / 1000} seconds. so if defer will suck i will remove it
export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    loadContext: AppLoadContext
) {
    for (const handler of otherRootRouteHandlers!) {
        const otherRouteResponse = await handler(request, remixContext);
        if (otherRouteResponse) return otherRouteResponse;
    }

    return new Promise((resolve, reject) => {
        let shellRendered = false;

        const cache = createEmotionCache(); // basically CacheProvider is there, cause custom cache key. it works without it tho

        // ~<50ms
        const { pipe, abort } = renderToPipeableStream(
            <CacheProvider value={cache}>
                <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
            </CacheProvider>,
            {
                onShellReady() {
                    shellRendered = true;
                    const body = new PassThrough();

                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set("Content-Type", "text/html");
                    responseHeaders.set(
                        "x-response-time",
                        Date.now() - Number(loadContext.start) + "ms"
                    );

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;

                    if (shellRendered) {
                        console.error(error);
                    }
                },
                onAllReady() {
                    abort();
                }
            }
        );

        // const str = renderToString( 41.64ms
        // 	<CacheProvider value={cache}>
        // 		<RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
        // 	</CacheProvider>
        // );
        //
        // responseHeaders.set("Content-Type", "text/html");
        // responseHeaders.set("x-response-time", Date.now() - Number(loadContext.start) + "ms");
        //
        // resolve(
        // 	new Response("<!DOCTYPE html>" + str, {
        // 		headers: responseHeaders,
        // 		status: responseStatusCode
        // 	})
        // );
        setTimeout(abort, ABORT_DELAY);
    });
}
