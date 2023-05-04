import { Icon, Stack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { BiCheckShield } from "react-icons/bi";
import { useAdBlock } from "../utils/func/hooks/useAdBlock";

export default function AdblockDetected() {
	const adBlockDetected = useAdBlock();

	return (
		<AnimatePresence>
			{adBlockDetected && (
				<motion.div
					initial={{ height: 0, opacity: 0 }}
					animate={{ height: "auto", opacity: 1 }}
					exit={{ height: 0 }}
					style={{ display: "block", zIndex: 19000 }}
					transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.2 }}
				>
					<Stack
						direction={{ base: "column", sm: "row" }}
						bg={"rgba(194, 57, 82, 0.2)"}
						justifyContent={"center"}
						w="100%"
						alignItems={"center"}
						py={2}
						px={2}
						boxShadow={"-2px 0px 0px 5px rgba(194, 57, 82, 0.2)"}
					>
						<Icon as={BiCheckShield} boxSize={8} />
						<Text fontWeight={"semibold"} textAlign={"center"}>
							It looks like you're using adblock. Please consider disabling it, to support us for free!
						</Text>
					</Stack>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
