import type { HeadersArgs } from "@remix-run/node";

export function cachePageHeaders({ loaderHeaders }: HeadersArgs) {
    if (loaderHeaders.get("Cache-Control")) {
        return loaderHeaders;
    }

    return new Headers({
        "Cache-Control": "public, s-maxage=360, stale-while-revalidate=86400",
        Vary: "Cookie, Accept-Encoding"
    });
}
