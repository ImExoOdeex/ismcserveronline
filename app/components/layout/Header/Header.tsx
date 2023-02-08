import { Box, Flex, Heading, HStack, Icon, Menu, MenuButton, MenuItem, MenuList, Text, useColorMode, useEventListener } from "@chakra-ui/react";
import Link from "../../utils/Link";
import APIButton from "./APIButton";
import ThemeToggle from "./ToggleTheme";
import FAQButton from "./FAQButton";
import InviteButton from "./InviteButton";
import HamburgerMenu from "./Mobile/HamburgerMenu";
import { ExternalLinkIcon, MoonIcon, QuestionOutlineIcon, SunIcon } from "@chakra-ui/icons";
import { BiCode, BiHome } from "react-icons/bi";
import ServerSearch from "./ServerSearch";
import links from "../../config/links.json"
import { useEffect, useState } from "react";

export default function Header() {

    useEventListener('keydown', (event: any) => {
        const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
        const hotkey = isMac ? 'metaKey' : 'ctrlKey'
        if (event?.key?.toLowerCase() === 'i' && event[hotkey]) {
            event.preventDefault()
            toggleColorMode()
        }
    })

    const { toggleColorMode, colorMode } = useColorMode()

    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <Flex as={'header'} w='100%' h='80px' pos={"sticky"} top={0} bg="bg" zIndex={1799} borderBottom={"1px"} borderBottomColor={scrollPosition > 0 ? 'alpha' : "transparent"} transition={"all .2s"}>
            <Flex w='100%' maxW={'1500px'} px={4} alignItems='center' h='100%' mx='auto' justifyContent={'space-between'}>
                <HStack spacing={5}>
                    <Link to='/' alignItems={'center'}>
                        <Heading as={'h1'} fontSize='2xl' transition={'.1s'}
                            transform={'auto-gpu'} _active={{ scale: .9 }}
                        >IsMcServer.online</Heading>
                    </Link>
                    <ServerSearch />
                </HStack>

                <HStack spacing={3} display={{ base: 'none', lg: 'flex' }}>
                    <FAQButton />
                    <APIButton />
                    <ThemeToggle />
                    <InviteButton />
                </HStack>

                <Box display={{ base: 'flex', lg: 'none' }} cursor='pointer'>
                    <Menu>
                        {({ isOpen }) => (

                            <>
                                <MenuButton>
                                    <HamburgerMenu isOpen={isOpen} />
                                </MenuButton>
                                <MenuList bg="bg" _focus={{ bg: "alpha" }} _active={{ bg: "alpha" }}>
                                    <Link to={"/"} _hover={{ textDecor: "none" }}>
                                        <MenuItem bg="bg">
                                            <Flex flexDir={"row"} justifyContent={"space-between"} w='100%'>
                                                <Text>
                                                    Home
                                                </Text>
                                                <BiHome />
                                            </Flex>
                                        </MenuItem>
                                    </Link>
                                    <Link to={"/faq"} _hover={{ textDecor: "none" }}>
                                        <MenuItem bg="bg">
                                            <Flex flexDir={"row"} justifyContent={"space-between"} w='100%'>
                                                <Text>
                                                    FAQ
                                                </Text>
                                                <QuestionOutlineIcon />
                                            </Flex>
                                        </MenuItem>
                                    </Link>
                                    <a href={links.rapidAPI} target={'_blank'} rel="noreferrer">
                                        <MenuItem bg="bg">
                                            <Flex flexDir={"row"} justifyContent={"space-between"} w='100%'>
                                                <HStack>
                                                    <Text>
                                                        API
                                                    </Text>
                                                    <ExternalLinkIcon opacity={.7} />
                                                </HStack>
                                                <Icon as={BiCode} />
                                            </Flex>
                                        </MenuItem>
                                    </a>
                                    <a href={links.discordBotInvite}>
                                        <MenuItem bg="bg">
                                            <Flex flexDir={"row"} justifyContent={"space-between"} w='100%'>
                                                <HStack>
                                                    <Text>
                                                        Invite bot
                                                    </Text>
                                                    <ExternalLinkIcon opacity={.7} />
                                                </HStack>
                                                <Icon h={'24px'} fill={"text"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36"><defs></defs><g id="图层_2" data-name="图层 2"><g id="Discord_Logos" data-name="Discord Logos"><g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White"><path className="cls-1" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></g></g></g></svg>
                                                </Icon>
                                            </Flex>
                                        </MenuItem>
                                    </a>
                                    <MenuItem bg="bg" onClick={toggleColorMode}>
                                        <Flex flexDir={"row"} justifyContent={"space-between"} w='100%'>
                                            <Text>
                                                Toggle {colorMode == "light" ? "dark" : "light"}
                                            </Text>
                                            {colorMode == "light" ? <MoonIcon /> : <SunIcon />}
                                        </Flex>
                                    </MenuItem>
                                </MenuList>
                            </>
                        )}
                    </Menu>
                </Box>

            </Flex>
        </Flex>
    )
}