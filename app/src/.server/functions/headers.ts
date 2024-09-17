import type { HeadersArgs, HeadersFunction } from "@remix-run/node";

export function cachePageHeaders({ loaderHeaders }: HeadersArgs): ReturnType<HeadersFunction> {
    return new Headers({
        "Cache-Control": loaderHeaders.get("Cache-Control") ?? "public, s-maxage=360, stale-while-revalidate=86400",
        Vary: "Cookie, Accept-Encoding"
    });
}
