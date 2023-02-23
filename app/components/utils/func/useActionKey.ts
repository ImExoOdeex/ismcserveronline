import { useEffect, useState } from "react";

export function useActionKey() {
	const [actionKey, setActionKey] = useState("Ctrl");
	useEffect(() => {
		if (typeof navigator === "undefined") return;
		const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
		if (isMac) {
			setActionKey("⌘");
		}
	}, []);

	return actionKey;
}
