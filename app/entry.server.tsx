import { CacheProvider } from "@emotion/react";
import { createReadableStreamFromReadable, type EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "stream";
import { createEmotionCache } from "./context";

const ABORT_DELAY = 7000;

// this will abort the request if it's not finished in 5 seconds. so if defer will suck i will remove it
export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;

		const cache = createEmotionCache(); // basically CacheProvider it there, cause custom cache key. it works without it tho

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

		setTimeout(abort, ABORT_DELAY);
	});
}
