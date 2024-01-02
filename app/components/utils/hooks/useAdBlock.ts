import { useMatches } from "@remix-run/react";
import { useEffect, useState } from "react";

export function useAdBlock() {
	const [adBlockDetected, setAdBlockDetected] = useState(false);
	const { showAds }: { showAds: boolean } = useMatches()[0].data;

	useEffect(() => {
		if (!showAds) return;

		fetch("https://www3.doubleclick.net", {
			method: "HEAD",
			mode: "no-cors",
			cache: "no-store"
		}).catch(() => {
			setAdBlockDetected(true);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!showAds) return false;

	return adBlockDetected;
}
