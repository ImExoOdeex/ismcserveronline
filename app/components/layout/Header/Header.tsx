import { Flex, Heading, HStack, useColorMode, useEventListener } from "@chakra-ui/react";
import Link from "../../utils/Link";
import APIButton from "./APIButton";
import ServerSearch from "./ServerSearch";
import ThemeToggle from "./ToggleTheme";
import FAQButton from "./FAQButton";

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

    return (
        <Flex as={'header'} w='100%' h='80px'>
            <Flex w='100%' maxW={'1500px'} px={4} alignItems='center' h='100%' mx='auto' justifyContent={'space-between'}>
                <HStack>
                    <Link to='/' alignItems={'center'}>
                        <Heading as={'h1'} fontSize='2xl'>IsMcServer.online</Heading>
                    </Link>
                    {/* <Link to='/awda' alignItems={'center'}>
                        <Heading as={'h1'} fontSize='xl'>server</Heading>
                    </Link> */}
                </HStack>

                <HStack spacing={3}>
                    <ServerSearch />
                    <FAQButton />
                    <APIButton />
                    <ThemeToggle />
                </HStack>

            </Flex>
        </Flex>
    )
}