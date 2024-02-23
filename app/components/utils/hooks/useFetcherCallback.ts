import { useEffect } from "react";
import { UseDataFunctionReturn, useTypedFetcher } from "remix-typedjson";

export default function useFetcherCallback<T = any>(callback: (data: UseDataFunctionReturn<T>) => void) {
	const fetcher = useTypedFetcher<T>();

	useEffect(() => {
		if (fetcher.data) {
			callback(fetcher.data);
		}
	}, [fetcher.data]);

	return fetcher;
}
