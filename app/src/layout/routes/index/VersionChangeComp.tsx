import { ChakraBox } from "@/layout/global/MotionComponents";
import { Transition } from "framer-motion";

export function VersionChangeComp() {
	return (
		<ChakraBox
			zIndex={-1}
			layout={"position"}
			layoutId={"version-change"}
			w="100%"
			h="100%"
			right={0}
			left={0}
			top={0}
			pos={"absolute"}
			rounded={"xl"}
			display="inline-flex"
			transition={{ ease: [0.25, 0.1, 0.25, 1] } as Transition as any}
			bottom={0}
			bg="invNormal"
		/>
	);
}
