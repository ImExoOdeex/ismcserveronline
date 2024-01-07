import { useEffect, useRef } from "react";
import { UseDataFunctionReturn, useTypedLoaderData } from "remix-typedjson";

export default function useAnimationLoaderData<T extends any>() {
	const lastData = useRef({});
	const data = useTypedLoaderData<T>() || (lastData.current as UseDataFunctionReturn<T>);
	useEffect(() => {
		if (data) lastData.current = data;
	}, [data]);

	return data;
}
