import { useActionKey } from "@/hooks/useActionKey";
import config from "@/utils/config";
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
import { startTransition, useCallback } from "react";

export default function ThemeToggle() {
    const color = useColorModeValue("purple.800", "yellow.400");
    const bgColor = useColorModeValue("rgba(68, 51, 122, .1)", "rgba(236, 201, 75,.1)");
    const bgColorActive = useColorModeValue("rgba(68, 51, 122, .2)", "rgba(236, 201, 75,.2)");
    const { colorMode, toggleColorMode } = useColorMode();

    const toggleTheme = useCallback(() => {
        startTransition(() => {
            toggleColorMode();
        });
    }, [toggleColorMode]);

    useEventListener(null, "keydown", (event) => {
        if (!event) return;

        const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform);
        const hotkey = isMac ? "metaKey" : "ctrlKey";
        if (event?.key?.toLowerCase() === "i" && event[hotkey] && !event.shiftKey) {
            event.preventDefault();
            toggleTheme();
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
                            Toggle {colorMode === "light" ? "Dark" : "Light"}{" "}
                            <DarkMode>({actionKey} + i)</DarkMode>
                        </Text>
                    }
                    openDelay={1000}
                >
                    <IconButton
                        role="group"
                        _hover={{
                            bg: bgColor,
                            color: color
                        }}
                        _active={{ bg: bgColorActive, scale: 0.9 }}
                        rounded={"xl"}
                        bg={"transparent"}
                        transform={"auto-gpu"}
                        icon={
                            colorMode === "light" ? (
                                <MoonIcon
                                    sx={{
                                        ".group:hover &": {
                                            rotate: "-100deg"
                                        }
                                    }}
                                    transition={`transform .4s ${config.cubicEase}`}
                                    transform="auto"
                                />
                            ) : (
                                <SunIcon
                                    sx={{
                                        ".group:hover &": {
                                            rotate: "50deg",
                                            scale: 1.05
                                        }
                                    }}
                                    transition={`transform .4s ${config.cubicEase}`}
                                    transform="auto"
                                />
                            )
                        }
                        aria-label={"Toggle color mode"}
                        onClick={toggleTheme}
                    />
                </Tooltip>
            </motion.div>
        </AnimatePresence>
    );
}
