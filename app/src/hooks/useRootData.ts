import { useEffect, useRef } from "react";
import type { UseDataFunctionReturn } from "remix-typedjson";
import { useTypedRouteLoaderData } from "remix-typedjson";
import type { loader } from "~/root";

export default function useRootData() {
    const lastData = useRef({});
    const data =
        useTypedRouteLoaderData<typeof loader>("root")! ||
        (lastData.current as UseDataFunctionReturn<typeof loader>);
    useEffect(() => {
        if (data) lastData.current = data;
    }, [data]);

    return data;
}
