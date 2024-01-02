import { useTypedRouteLoaderData } from "remix-typedjson";
import type { loader } from "~/root";

export default function useRootData() {
	return useTypedRouteLoaderData<typeof loader>("root")!;
}
