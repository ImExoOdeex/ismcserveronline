import { useLocation, useNavigation } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import useInsideEffect from "./useInsideEffect";

interface Props {
	initialProgress?: number;
	trickleTime?: number;
	trickleAmount?: number;
}

export function useProgressBar({ trickleTime = 250, trickleAmount = 3, initialProgress = 5 }: Props = {}) {
	const { state } = useNavigation();
	const { pathname: path } = useLocation();
	const [hasBeenStarted, setHasBeenStarted] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isTrickling, setIsTrickling] = useState(false);

	useEffect(() => {
		if (progress === 0) return;

		const interval = setInterval(() => {
			setProgress((prevProgress) => {
				const newProgress = prevProgress + trickleAmount;
				if (newProgress >= 90 && newProgress < 100) {
					clearInterval(interval);
					return 90;
				} else if (newProgress >= 100) {
					clearInterval(interval);
					return 100;
				}
				return newProgress;
			});
		}, trickleTime);

		if (!isTrickling) {
			clearInterval(interval);
		}

		return () => {
			clearInterval(interval);
		};
	}, [isTrickling]);

	const start = useCallback(() => {
		setProgress(initialProgress);

		setIsTrickling(true);
		setHasBeenStarted(true);
	}, [progress, setProgress, initialProgress, setIsTrickling]);

	const done = useCallback(
		(ignoreWarning = false) => {
			if (!ignoreWarning && progress === 0) {
				console.warn("called done() before start()");
				return;
			}

			setProgress(100);
			setIsTrickling(false);
			setHasBeenStarted(false);
		},
		[progress, setProgress]
	);

	useInsideEffect(() => {
		if (state !== "idle") {
			start();
		} else {
			done();
		}
	}, [state]);

	const onHide = useCallback(() => {
		setProgress(0);
		setIsTrickling(false);
	}, [setProgress, setIsTrickling]);

	const startAndDone = useCallback(() => {
		flushSync(() => {
			start();
		});
		// i tried to start() and then done() with flushSync but it didn't work smh // nvm idk how this stupid react works,
		// but if id now read {progress}, it would still show old value (0), but done() would not work so idfk
		setTimeout(() => {
			done(true);
		}, 40);
	}, [start, done]);

	useInsideEffect(() => {
		startAndDone();
	}, [path]);

	return {
		progress,
		onHide,
		hasBeenStarted,
		startAndDone,
		start,
		done
	};
}
