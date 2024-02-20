import createCache from "@emotion/cache";
import { createContext } from "react";
export interface ClientStyleContextData {
	reset: () => void;
	hydrationTime: number;
}

export const ClientStyleContext = createContext<ClientStyleContextData | null>(null);

export function createEmotionCache() {
	return createCache({
		key: "uwu"
	});
}
