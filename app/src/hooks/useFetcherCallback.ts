import { useEffect } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import { useTypedFetcher } from "remix-typedjson";

export default function useFetcherCallback<T = any>(
    callback?: (data: UseDataFunctionReturn<T>) => void,
    opts?: {
        key?: string;
    }
) {
    const fetcher = useTypedFetcher<T>(opts);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (fetcher.data) {
            callback?.(fetcher.data);
        }
    }, [fetcher.data]);

    return fetcher;
}
