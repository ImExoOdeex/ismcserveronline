import useInsideEffect from "@/hooks/useInsideEffect";
import { useMatches } from "@remix-run/react";
import { useRef } from "react";

export default function useAnimationMatchesData(index: number) {
    const last = useRef(null);
    const matches = (useMatches()[index].data ?? last.current) as any;
    useInsideEffect(() => {
        if (matches) last.current = matches;
    }, [matches]);

    return matches;
}
