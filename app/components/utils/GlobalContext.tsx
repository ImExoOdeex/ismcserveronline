import { useLocation } from "@remix-run/react";
import React, { createContext, useEffect, useState } from "react";
import { useAdBlock } from "./hooks/useAdBlock";

type Props = {
	children?: React.ReactNode;
};

type contextType = {
	displayGradient?: boolean;
	gradientColor?: string;
	displayLogoInBg?: boolean;
	hasAdblock?: boolean;
	updateData: (key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) => void;
};

export const context = createContext<contextType>({ updateData(key, value) {} });

export function GlobalContext({ children }: Props) {
	const path = useLocation().pathname;

	function getNewGradientColor() {
		return path === "/api" ? "green.500" : path.includes("/popular-servers") ? "gold" : "brand";
	}

	console.log(' path.startsWith("/dashboard")', path.startsWith("/dashboard"));

	const hasAdblock = useAdBlock();

	const [data, setData] = useState({
		displayGradient: true,
		gradientColor: getNewGradientColor(),
		displayLogoInBg: path.startsWith("/dashboard"),
		updateData
	});

	function updateData(key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) {
		setData((prev) => ({ ...prev, [key]: value }));
	}

	useEffect(() => {
		updateData("gradientColor", getNewGradientColor());
		updateData("displayLogoInBg", path.startsWith("/dashboard"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path]);

	return (
		<context.Provider
			value={{
				...data,
				hasAdblock
			}}
		>
			{children}
		</context.Provider>
	);
}
