import { Box, Flex, Heading, HStack, useColorMode, useDisclosure, useEventListener } from "@chakra-ui/react";
import Link from "../../utils/Link";
import APIButton from "./APIButton";
import ServerSearch from "./ServerSearch";
import ThemeToggle from "./ToggleTheme";
import FAQButton from "./FAQButton";
import HamburgerMenu from "./Mobile/HamburgerMenu";
import MobileMenu from "./Mobile/MobileMenu";

export default function Header() {
    const { toggleColorMode } = useColorMode()

    useEventListener('keydown', (event: any) => {
        const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
        const hotkey = isMac ? 'metaKey' : 'ctrlKey'
        if (event?.key?.toLowerCase() === 'i' && event[hotkey]) {
            event.preventDefault()
            toggleColorMode()
        }
    })

    // const [isOpen, setIsOpen] = useState<boolean>(false)
    const { isOpen, onOpen, onClose, onToggle } = useDisclosure()

    return (
        <Flex as={'header'} w='100%' h='80px'>
            <Flex w='100%' maxW={'1500px'} px={4} alignItems='center' h='100%' mx='auto' justifyContent={'space-between'}>
                <Link to='/' alignItems={'center'}>
                    <Heading as={'h1'} fontSize='2xl'>IsMcServer.online</Heading>
                </Link>

                <HStack spacing={3} display={{ base: 'none', lg: 'flex' }}>
                    <ServerSearch />
                    <FAQButton />
                    <APIButton />
                    <ThemeToggle />
                </HStack>

                <Box display={{ base: 'flex', lg: 'none' }} cursor='pointer'>
                    <HamburgerMenu isOpen={isOpen} onClick={onToggle} />
                    <MobileMenu isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
                </Box>

            </Flex>
        </Flex>
    )
}