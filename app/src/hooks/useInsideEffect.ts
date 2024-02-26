import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export default function useInsideEffect(effect: EffectCallback, deps: DependencyList) {
	const init = useRef(true);

	useEffect(() => {
		if (init.current) {
			init.current = false;
			return;
		}
		return effect();
	}, deps);
}
