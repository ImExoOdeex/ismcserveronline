import { useContext } from "react";
import { context } from "../utils/GlobalContext";

export default function useGlobalContext() {
	const contextValue = useContext(context);
	if (!contextValue) {
		throw new Error("useGlobalContext must be used within a GlobalContext");
	}
	return contextValue;
}
