import Link from "@/layout/global/Link";
import DiscordIcon from "@/layout/global/icons/DiscordIcon";
import config from "@/utils/config";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Modal as ChakraModal,
    Flex,
    HStack,
    Icon,
    Input,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    VStack,
    useColorMode,
    useColorModeValue
} from "@chakra-ui/react";
import { useFetcher, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";

export default function Modal({
    isOpen,
    onClose
}: { isOpen: boolean; onOpen: () => void; onClose: () => void }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const fetcher = useFetcher();
    const submitting = fetcher.state !== "idle";

    const [server, setServer] = useState<string>("");
    const borderInputAutoFill = useColorModeValue("#dfe4e8", "#262626");
    const bgInputAutoFill = useColorModeValue("#e2e8f0", "#1d1d1d");
    const initialRef = useRef(null);

    const location = useLocation();
    const lastPath = useRef(location?.pathname);

    useEffect(() => {
        if (location.pathname !== lastPath.current) {
            onClose();
        }
    }, [location.pathname, onClose]);

    const darkAlpha = useColorModeValue("whiteAlpha.600", "blackAlpha.700");

    return (
        <>
            <ChakraModal
                initialFocusRef={initialRef}
                scrollBehavior="inside"
                motionPreset="slideInBottom"
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay backdropFilter={"blur(4px)"} transition={".2s"} />
                <ModalContent
                    border={"1px solid"}
                    borderColor={"alpha100"}
                    zIndex={"999999 !important"}
                    mx={4}
                    rounded={"xl"}
                    mt={16}
                    bg={darkAlpha}
                    backdropFilter={"blur(50px) brightness(200%)"}
                    mb={4}
                >
                    <ModalHeader>Menu</ModalHeader>
                    <ModalBody overflowY={"hidden"} pb={0} zIndex={99999999999}>
                        <fetcher.Form
                            method="POST"
                            style={{ position: "relative", minWidth: "302px", width: "100%" }}
                        >
                            <Box as="label" srOnly for="search">
                                Search
                            </Box>

                            <Flex pos={"relative"}>
                                <Input
                                    variant={"filled"}
                                    w="100%"
                                    display={"block"}
                                    rounded={"xl"}
                                    // border={"2px"}
                                    px={4}
                                    bg={"alpha"}
                                    py={1.5}
                                    pl={10}
                                    pr={14}
                                    fontWeight={"normal"}
                                    // _focus={{ borderColor: "brand" }}
                                    // borderColor={"alpha100"}
                                    _autofill={{
                                        borderColor: borderInputAutoFill,
                                        boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`,
                                        _active: {
                                            borderColor: "brand",
                                            boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`
                                        },
                                        _focus: {
                                            borderColor: "brand",
                                            boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`
                                        },
                                        _hover: {
                                            borderColor: "brand",
                                            boxShadow: `0 0 0px 1000px ${bgInputAutoFill} inset`
                                        }
                                    }}
                                    disabled={submitting}
                                    minLength={1}
                                    name="server"
                                    onChange={(e) => setServer(e.currentTarget.value)}
                                    value={server}
                                    placeholder={
                                        fetcher.data
                                            ? (fetcher.data as any)?.error
                                            : "Server address"
                                    }
                                />
                                <Flex
                                    pos={"absolute"}
                                    insetY={"0"}
                                    left={0}
                                    alignItems={"center"}
                                    pl={4}
                                >
                                    {submitting ? (
                                        <Spinner size={"sm"} />
                                    ) : (
                                        <Icon
                                            as={BiSearchAlt}
                                            boxSize={5}
                                            color={"text"}
                                            fill={"text"}
                                        />
                                    )}
                                </Flex>

                                <AnimatePresence initial={false}>
                                    {server.length >= 1 && server.includes(".") && (
                                        <motion.div
                                            initial={{ y: -40, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -40, opacity: 0 }}
                                            transition={{ ease: [0.25, 0.1, 0.25, 1] }}
                                            style={{
                                                position: "absolute",
                                                bottom: "-48px",
                                                left: 0,
                                                right: 0,
                                                width: "100%"
                                            }}
                                        >
                                            <Button
                                                type="submit"
                                                variant={"brand"}
                                                w="100%"
                                                isLoading={submitting}
                                            >
                                                Search
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Flex>
                        </fetcher.Form>
                        <AnimatePresence initial={false}>
                            <motion.div
                                animate={
                                    server.length >= 1 && server.includes(".")
                                        ? { height: "36px" }
                                        : {
                                              height: 0
                                          }
                                }
                                transition={{ ease: [0.25, 0.1, 0.25, 1] }}
                            />
                        </AnimatePresence>
                        <VStack
                            mt={7}
                            fontWeight={600}
                            spacing={10}
                            h="100%"
                            alignItems={"center"}
                            justifyContent={"center"}
                        >
                            <Link to="/">Homepage</Link>
                            <Link to="/popular-servers">Popular servers</Link>
                            <Link to="/faq">FAQ</Link>
                            <Link to="/api">API</Link>
                        </VStack>
                    </ModalBody>
                    <ModalFooter pt={7}>
                        <VStack w="100%">
                            <Button w="100%" onClick={toggleColorMode} colorScheme="pink">
                                <HStack>
                                    {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                                    <Text>Toggle {colorMode === "dark" ? "light" : "dark"}</Text>
                                </HStack>
                            </Button>
                            <Button
                                w="100%"
                                as={Link}
                                to={config.discordBotInvite}
                                onClick={toggleColorMode}
                                color={"white"}
                                bg="discord.100"
                                _hover={{ textDecoration: "none", bg: "discord.900" }}
                            >
                                <HStack>
                                    <DiscordIcon />
                                    <Text>Invite bot</Text>
                                </HStack>
                            </Button>
                            <Button ref={initialRef} w="100%" onClick={onClose} variant={"brand"}>
                                Close
                            </Button>
                        </VStack>
                    </ModalFooter>
                </ModalContent>
            </ChakraModal>
        </>
    );
}
