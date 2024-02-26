import createCache from "@emotion/cache";
import { createContext, useContext } from "react";

export interface ClientStyleContextData {
	reset: () => void;
	hydrationTime: number;
}

export const ClientStyleContext = createContext<ClientStyleContextData | null>(null);

export function useClientStyle() {
	return useContext(ClientStyleContext);
}

export function createEmotionCache() {
	return createCache({
		key: "uwu"
	});
}
