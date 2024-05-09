import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import config from "@/utils/config";
import { ArrowForwardIcon, Icon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    IconButton,
    Input,
    Link as ChakraLink,
    Text,
    useColorMode,
    useColorModeValue
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { mobileMenuTransition } from "../../Layout";
import useFetcherCallback from "@/hooks/useFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";

interface Props {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const routes = [
    {
        name: "Homepage",
        link: "/"
    },
    {
        name: "Search Servers",
        link: "/search"
    },
    {
        name: "FAQ",
        link: "/faq"
    },
    {
        name: "API",
        link: "/api"
    }
];

export default function SideMenu({ isOpen, setIsOpen }: Props) {
    const bg = useColorModeValue("white", "bg");

    const { colorMode, toggleColorMode } = useColorMode();

    const [server, setServer] = useState<string>("");
    const fetcher = useFetcherCallback();
    const borderInputAutoFill = useColorModeValue("#dfe4e8", "#262626");
    const bgInputAutoFill = useColorModeValue("#e2e8f0", "#1d1d1d");
    const submitting = useMemo(() => {
        return fetcher.state !== "idle";
    }, [fetcher.state]);

    useInsideEffect(() => {
        setIsOpen(false);
    }, [fetcher.state]);

    const user = useUser();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: "80vw" }}
                animate={{ x: isOpen ? 0 : "80vw" }}
                transition={mobileMenuTransition}
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "80vw",
                    zIndex: 9999
                }}
            >
                <Flex
                    gap={10}
                    py={4}
                    px={6}
                    flexDir={"column"}
                    h="100vh"
                    w={"100%"}
                    borderLeft={"1px solid"}
                    borderColor={"alpha300"}
                    bg={bg}
                >
                    <Flex w="100%" alignItems={"center"} justifyContent={"space-between"}>
                        <Heading fontSize={"2xl"} fontWeight={600}>
                            Menu
                        </Heading>

                        <IconButton
                            variant={"unstyled"}
                            aria-label="Close Menu"
                            icon={<ArrowForwardIcon boxSize={5} />}
                            onClick={() => setIsOpen(false)}
                        />
                    </Flex>

                    <Flex w="100%" flexDir={"column"} gap={4}>
                        <fetcher.Form method="POST" style={{ position: "relative", width: "100%" }}>
                            <Box as="label" srOnly for="search">
                                Search
                            </Box>

                            <Flex pos={"relative"} flexDir="column" gap={4}>
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
                                    top={3}
                                    left={0}
                                    alignItems={"center"}
                                    pl={4}
                                >
                                    <Icon
                                        as={BiSearchAlt}
                                        boxSize={5}
                                        color={"text"}
                                        fill={"text"}
                                    />
                                </Flex>

                                <AnimatePresence initial={false}>
                                    {server.length >= 1 && server.includes(".") && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ ease: [0.25, 0.1, 0.25, 1] }}
                                            style={{
                                                overflow: "hidden"
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

                        <Divider />

                        <Text
                            fontSize={"xl"}
                            fontWeight={600}
                            _hover={{
                                textDecoration: "none",
                                color: "brand"
                            }}
                            onClick={toggleColorMode}
                        >
                            Toggle {colorMode === "light" ? "Dark" : "Light"}
                        </Text>
                    </Flex>

                    <Flex w="100%" flexDir={"column"} gap={4}>
                        <Divider />

                        {routes.map((route) => (
                            <Link
                                key={route.name}
                                to={route.link}
                                fontSize={"xl"}
                                fontWeight={600}
                                onClick={() => setIsOpen(false)}
                                _hover={{
                                    textDecoration: "none",
                                    color: "brand"
                                }}
                            >
                                {route.name}
                            </Link>
                        ))}
                    </Flex>

                    <Flex w="100%" flexDir={"column"} gap={4}>
                        <Divider />

                        <Link
                            to={"/login"}
                            fontSize={"xl"}
                            fontWeight={600}
                            onClick={() => setIsOpen(false)}
                            _hover={{
                                textDecoration: "none",
                                color: "brand"
                            }}
                        >
                            {user ? "Dashboard" : "Login"}
                        </Link>

                        <ChakraLink
                            href={config.discordBotInvite}
                            fontSize={"xl"}
                            fontWeight={600}
                            onClick={() => setIsOpen(false)}
                            _hover={{
                                textDecoration: "none",
                                color: "brand"
                            }}
                        >
                            Invite bot
                        </ChakraLink>
                    </Flex>
                </Flex>
            </motion.div>
        </AnimatePresence>
    );
}
