import { fireworks } from "@tsparticles/fireworks";
import { useEffect } from "react";

export default function useFireworks() {
	useEffect(() => {
		(async () => {
			await fireworks({
				rate: {
					max: 7,
					min: 3
				},
				speed: {
					max: 5,
					min: 1
				},
				brightness: 100,
				gravity: 5,
				sounds: false
			});
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}
