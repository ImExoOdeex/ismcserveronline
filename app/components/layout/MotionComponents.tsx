import { chakra, shouldForwardProp } from "@chakra-ui/react";
import { isValidMotionProp, motion } from "framer-motion";

const ChakraInput = chakra(motion.input, {
	shouldForwardProp: (prop) =>
		isValidMotionProp(prop) || shouldForwardProp(prop)
});

const ChakraBox = chakra(motion.div, {
	shouldForwardProp: (prop) =>
		isValidMotionProp(prop) || shouldForwardProp(prop)
});

export { ChakraInput, ChakraBox };
