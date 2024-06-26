import { useEffect } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher";

export default function useDebouncedFetcherCallback<T = any>(
    callback: (data: UseDataFunctionReturn<T>) => void
) {
    const fetcher = useDebounceFetcher<any>();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (fetcher.data) {
            callback(fetcher.data);
        }
    }, [fetcher.data]);

    return fetcher as typeof fetcher & { data: UseDataFunctionReturn<T> };
}
