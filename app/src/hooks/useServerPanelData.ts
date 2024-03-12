import useAnimationRouteLoaderData from "@/hooks/useAnimationRouteLoaderData";
import type { loader } from "~/routes/$server_.panel";

export default function useServerPanelData() {
	const serverData =
		useAnimationRouteLoaderData<typeof loader>("routes/$server_.panel").server ||
		// eslint-disable-next-line
		useAnimationRouteLoaderData<typeof loader>("routes/bedrock.$server_.panel").server;

	return serverData;
}
