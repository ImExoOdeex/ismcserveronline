import { useLocation } from "@remix-run/react";
import React, { createContext, useState } from "react";
import { useEffect } from "react";

type Props = {
	children?: React.ReactNode;
};

type contextType = {
	displayGradient?: boolean;
	gradientColor?: string;
	displayLogoInBg?: boolean;
	updateData: (key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) => void;
};

export const context = createContext<contextType>({ updateData(key, value) {} });

export function GlobalContext({ children }: Props) {
	const [data, setData] = useState({
		displayGradient: true,
		gradientColor: "rgba(86, 59, 159, 0.3)",
		displayLogoInBg: false,
		updateData
	});

	function updateData(key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) {
		setData((prev) => ({ ...prev, [key]: value }));
	}

	const path = useLocation().pathname;

	function getNewGradientColor() {
		return path === "/api" ? "green.500" : path.includes("/popular-servers") ? "gold" : "brand";
	}

	useEffect(() => {
		updateData("gradientColor", getNewGradientColor());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path]);

	return <context.Provider value={data}>{children}</context.Provider>;
}
