import useAnimationRouteLoaderData from "@/hooks/useAnimationRouteLoaderData";
import { loader } from "~/routes/$server_.panel";

export default function useServerPanelData() {
	const serverData =
		useAnimationRouteLoaderData<typeof loader>("routes/$server_.panel").server ||
		useAnimationRouteLoaderData<typeof loader>("routes/bedrock.$server_.panel").server;

	return serverData;
}
