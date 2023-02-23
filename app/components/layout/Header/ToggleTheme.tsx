import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
	DarkMode,
	IconButton,
	Text,
	Tooltip,
	useColorMode,
	useColorModeValue,
	useEventListener
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useActionKey } from "~/components/utils/func/useActionKey";

export default function ThemeToggle() {
	const color = useColorModeValue("purple.800", "yellow.400");
	const bgColor = useColorModeValue(
		"rgba(68, 51, 122, .1)",
		"rgba(236, 201, 75,.1)"
	);
	const bgColorActive = useColorModeValue(
		"rgba(68, 51, 122, .2)",
		"rgba(236, 201, 75,.2)"
	);
	const { colorMode, toggleColorMode } = useColorMode();

	useEventListener("keydown", (event: any) => {
		const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform);
		const hotkey = isMac ? "metaKey" : "ctrlKey";
		if (event?.key?.toLowerCase() === "i" && event[hotkey]) {
			event.preventDefault();
			toggleColorMode();
		}
	});

	const actionKey = useActionKey();

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.01 }}
				key={colorMode}
			>
				<Tooltip
					label={
						<Text alignItems={"center"}>
							Toggle {colorMode == "light" ? "Dark" : "Light"}{" "}
							<DarkMode>({actionKey} + i)</DarkMode>
						</Text>
					}
					openDelay={1000}
				>
					<IconButton
						role={"group"}
						_hover={{ bg: bgColor, color: color }}
						_active={{ bg: bgColorActive, scale: 0.9 }}
						rounded={"xl"}
						bg={"transparent"}
						transform={"auto-gpu"}
						icon={
							colorMode == "light" ? (
								<MoonIcon
									_groupHover={{ rotate: "-100deg" }}
									transition={"transform .4s"}
									transform="auto"
								/>
							) : (
								<SunIcon
									_groupHover={{
										rotate: "50deg",
										scale: 1.05
									}}
									transition={"transform .4s"}
									transform="auto"
								/>
							)
						}
						aria-label={"Toggle color mode"}
						onClick={toggleColorMode}
					/>
				</Tooltip>
			</motion.div>
		</AnimatePresence>
	);
}
