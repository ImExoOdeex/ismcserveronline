import { useEffect, useState } from "react";

export function useAdBlock() {
	const [adBlockDetected, setAdBlockDetected] = useState(false);

	useEffect(() => {
		fetch("https://www3.doubleclick.net", {
			method: "HEAD",
			mode: "no-cors",
			cache: "no-store"
		}).catch(() => {
			setAdBlockDetected(true);
		});
	}, []);

	return adBlockDetected;
}
