import { Button, Flex, Heading, useColorMode, useEventListener } from "@chakra-ui/react";
import Link from "../utils/Link";

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
            <Flex w='100%' maxW={'1500px'} alignItems='center' h='100%' mx='auto' justifyContent={'space-between'}>
                <Link to='/' alignItems={'center'}>
                    <Heading as={'h1'} fontSize='2xl'>IsMcServer.online?</Heading>
                </Link>



            </Flex>
        </Flex>
    )
}