import { useEffect, useRef } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import { useTypedRouteLoaderData } from "remix-typedjson";

// custom hook for getting loader data, cause there are page transitions with framer motion and they make page loose data on transition
export default function useAnimationRouteLoaderData<T>(id: string) {
	const lastData = useRef({});
	const data = useTypedRouteLoaderData<T>(id) || (lastData.current as UseDataFunctionReturn<T>);
	useEffect(() => {
		if (data) lastData.current = data;
	}, [data]);

	return data;
}
