import { ChakraBox } from "../MotionComponents";

export function VersionChangeComp() {
	return (
		<ChakraBox
			zIndex={-1}
			layoutId={"animations"}
			w="100%"
			h="100%"
			right={0}
			left={0}
			top={0}
			pos={"absolute"}
			rounded={"xl"}
			display="inline-flex"
			// @ts-ignore
			transition={{ ease: [0.25, 0.1, 0.25, 1] }}
			bottom={0}
			bg="invNormal"
		></ChakraBox>
	);
}
