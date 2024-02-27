import { useLocation } from "@remix-run/react";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "~/routes/$server";
import { useAdBlock } from "../hooks/useAdBlock";
import useUser from "../hooks/useUser";

interface Props {
	children?: React.ReactNode;
}

interface ContextType {
	displayGradient: boolean;
	displayLogoInBg: boolean;
	displayServerBackground: boolean;
	gradientColor: string;
	hasAdblock: boolean;
	updateData: (key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) => void;
}

export const context = createContext<ContextType | null>(null);

export function GlobalContext({ children }: Props) {
	const path = useLocation().pathname;
	const loaderData = useTypedRouteLoaderData<typeof loader>("routes/$server");

	const getNewGradientColor = useCallback(() => {
		if (loaderData?.foundServer.online === true || loaderData?.foundServer.online === false) {
			return loaderData.foundServer.online ? "green" : "red";
		}
		return path === "/api" ? "green.500" : path.includes("/popular-servers") ? "gold" : "brand.900";
	}, [loaderData?.foundServer, path]);

	const user = useUser();
	const hasAdblock = useAdBlock();

	const updateData = useCallback((key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) => {
		setData((prev) => ({ ...prev, [key]: value }));
	}, []);

	const [data, setData] = useState<Omit<ContextType, "hasAdblock">>({
		displayGradient: user?.everPurchased ? false : true,
		gradientColor: getNewGradientColor(),
		displayLogoInBg: path.startsWith("/dashboard"),
		displayServerBackground: true,
		updateData
	});

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
