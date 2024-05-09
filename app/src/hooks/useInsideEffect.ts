import type { DependencyList, EffectCallback } from "react";
import { useEffect, useRef } from "react";

export default function useInsideEffect(effect: EffectCallback, deps: DependencyList) {
    const init = useRef(true);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (init.current) {
            init.current = false;
            return;
        }
        return effect();
    }, deps);
}
