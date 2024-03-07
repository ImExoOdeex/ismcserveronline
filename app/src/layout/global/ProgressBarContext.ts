import { createContext, useContext } from "react";

interface ProgressBarContext {
	start: () => void;
	done: (ignoreWarning?: boolean) => void;
	startAndDone: () => void;
}

export const progressBarContext = createContext<ProgressBarContext | null>(null);

export function useProgressBarContext() {
	const context = useContext(progressBarContext);
	if (!context) {
		throw new Error("useProgressBarContext must be used within a ProgressBarProvider");
	}
	return context;
}
