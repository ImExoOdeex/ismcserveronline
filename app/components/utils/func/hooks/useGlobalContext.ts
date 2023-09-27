import { useContext } from "react";
import { context } from "../../GlobalContext";

export default function useGlobalContext() {
	return useContext(context);
}
