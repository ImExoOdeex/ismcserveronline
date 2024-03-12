import { useEffect } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher";

export default function useDebouncedFetcherCallback<T = any>(callback: (data: UseDataFunctionReturn<T>) => void) {
	const fetcher = useDebounceFetcher<any>();

	useEffect(() => {
		if (fetcher.data) {
			callback(fetcher.data);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return fetcher as typeof fetcher & { data: UseDataFunctionReturn<T> };
}
