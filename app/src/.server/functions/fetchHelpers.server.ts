import { isPrefetch } from "remix-utils/is-prefetch";

export function cachePrefetchHeaders(
    request: Request,
    headers: Headers = new Headers() /*, response headers*/
) {
    const isGet = request.method.toLowerCase() === "get";
    if (!isGet) return;

    const prefetch = isPrefetch(request);
    const headersHaveCacheControl = headers.has("Cache-Control");

    if (isGet && prefetch && !headersHaveCacheControl) {
        headers.set("Cache-Control", "public, max-age=5");
    }

    return headers;
}

export function cachePrefetch(request: Request, options: ResponseInit = {}) {
    const isGet = request.method.toLowerCase() === "get";
    if (!isGet) return;

    const purpose =
        request.headers.get("Purpose") ||
        request.headers.get("X-Purpose") ||
        request.headers.get("Sec-Purpose") ||
        request.headers.get("Sec-Fetch-Purpose") ||
        request.headers.get("Moz-Purpose");
    const headers = new Headers(options.headers);

    const isPrefetch = purpose === "prefetch";
    const headersHaveCacheControl = headers?.has("Cache-Control");

    if (isGet && isPrefetch && !headersHaveCacheControl) {
        headers.set("Cache-Control", "public, max-age=5");
    }
    options.headers = headers;

    return options;
}
