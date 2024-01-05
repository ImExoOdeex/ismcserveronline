import { useLocation } from "@remix-run/react";
import React, { createContext, useEffect, useState } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "~/routes/$server";
import { useAdBlock } from "./hooks/useAdBlock";
import useUser from "./hooks/useUser";

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
	const loaderData = useTypedRouteLoaderData<typeof loader>("routes/$server");

	function getNewGradientColor() {
		if (loaderData?.data?.online === true || loaderData?.data?.online === false) {
			return loaderData.data.online ? "green" : "red";
		}
		return path === "/api" ? "green.500" : path.includes("/popular-servers") ? "gold" : "brand.900";
	}

	const hasAdblock = useAdBlock();

	const user = useUser();

	const [data, setData] = useState({
		displayGradient: user?.everPurchased ? false : true,
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
