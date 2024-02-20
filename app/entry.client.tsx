import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";
import React, { startTransition, useCallback, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { ClientStyleContext, createEmotionCache } from "./context";

interface ClientCacheProviderProps {
	children: React.ReactNode;
	time: number;
}

function ClientCacheProvider({ children, time }: ClientCacheProviderProps) {
	const [cache, setCache] = useState(createEmotionCache());

	const reset = useCallback(() => {
		return setCache(createEmotionCache());
	}, []);

	return (
		<ClientStyleContext.Provider value={{ reset, hydrationTime: time }}>
			<CacheProvider value={cache}>{children}</CacheProvider>
		</ClientStyleContext.Provider>
	);
}

function hydrate() {
	const now = Date.now(); // initial hydration time

	startTransition(() => {
		hydrateRoot(
			document,
			<ClientCacheProvider time={now}>
				<RemixBrowser />
			</ClientCacheProvider>
		);
	});
}

if (typeof requestIdleCallback === "function") {
	requestIdleCallback(hydrate);
} else {
	setTimeout(hydrate, 1);
}
