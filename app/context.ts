// context.tsx
import { createContext } from "react";

export interface ServerStyleContextData {
	key: string;
	ids: Array<string>;
	css: string;
}

export const ServerStyleContext = createContext<ServerStyleContextData[] | null>(null);

export interface ClientStyleContextData {
	reset: () => void;
}

export const ClientStyleContext = createContext<ClientStyleContextData | null>(null);

import createCache from "@emotion/cache";

export const defaultCache = createEmotionCache();

export function createEmotionCache() {
	return createCache({ key: "x" });
}
