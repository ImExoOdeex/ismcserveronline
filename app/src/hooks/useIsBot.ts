import { useSearchParams } from "@remix-run/react";
import { useMemo } from "react";

export default function useIsBot(): boolean {
	const [params] = useSearchParams();

	const isBot = useMemo(() => {
		return params.get("bot") === "";
	}, [params]);

	return isBot;
}
