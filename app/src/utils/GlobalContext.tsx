import { useLocation } from "@remix-run/react";
import type React from "react";
import { createContext, useCallback, useEffect, useState } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import type { loader } from "~/routes/$server";
import useUser from "../hooks/useUser";

interface Props {
    children?: React.ReactNode;
}

interface ContextType {
    displayGradient: boolean;
    displayLogoInBg: boolean;
    displayServerBackground: boolean;
    gradientColor: string;
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
        return path === "/api" ? "green.500" : "brand.900";
    }, [loaderData?.foundServer, path]);

    const user = useUser();

    const updateData = useCallback(
        (key: "displayGradient" | "gradientColor" | "displayLogoInBg", value: any) => {
            setData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const [data, setData] = useState<Omit<ContextType, "hasAdblock">>({
        displayGradient: !user?.everPurchased,
        gradientColor: getNewGradientColor(),
        displayLogoInBg: path.startsWith("/dashboard"),
        displayServerBackground: true,
        updateData
    });

    useEffect(() => {
        updateData("gradientColor", getNewGradientColor());
        updateData("displayLogoInBg", path.startsWith("/dashboard"));
    }, [path, getNewGradientColor, updateData]);

    return (
        <context.Provider
            value={{
                ...data
            }}
        >
            {children}
        </context.Provider>
    );
}
