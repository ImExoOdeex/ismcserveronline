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

	useEffect(() => {
		if (fetcher.data) {
			callback?.(fetcher.data);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return fetcher;
}
