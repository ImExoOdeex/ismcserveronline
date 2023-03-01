import React, { createContext, useState } from "react";

type Props = {
	children?: React.ReactNode;
};

type contextType = {
	displayGradient?: boolean;
	gradientColor?: string;
	displayLogoInBg?: boolean;
	updateData: (key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) => void;
};

export const context = createContext<contextType | any>(null);

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

	return <context.Provider value={data}>{children}</context.Provider>;
}
