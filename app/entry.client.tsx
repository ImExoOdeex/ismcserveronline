import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";
import React, { startTransition, useCallback, useState } from "react";
import { hydrate } from "react-dom";
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

function hydration() {
	let now = Date.now(); // initial hydration time

	startTransition(() => {
		// hydrate, since hydrateRoot bugs with streaming with emotion
		hydrate(
			<ClientCacheProvider time={now}>
				<RemixBrowser />
			</ClientCacheProvider>,
			document
		);
	});
}

if (typeof requestIdleCallback === "function") {
	requestIdleCallback(hydration);
} else {
	setTimeout(hydration, 1);
}
