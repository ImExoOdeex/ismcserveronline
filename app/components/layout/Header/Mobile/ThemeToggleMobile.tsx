import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Button, Flex, Text, useColorMode, useColorModeValue } from '@chakra-ui/react'

function ThemeToggleMobile({ isOpen }: { isOpen: boolean }) {
    const ThemeBtnBg = useColorModeValue("brand.900", "orange.200")
    const searchBtnShadow = useColorModeValue("rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.3)")
    const { toggleColorMode, colorMode } = useColorMode()
    return (
        <Button onClick={toggleColorMode} w='100%' rounded={'2xl'}
            bg={ThemeBtnBg} _hover={{ bg: '' }} style={{ WebkitTapHighlightColor: 'transparent' }}
            shadow={`0px 2px 5px ${searchBtnShadow} `} color={'inv'}
        >
            <Flex alignItems={'center'}>

                <Text mr={3} fontSize='md'>Toggle {colorMode == 'light' ? "Dark" : "Light"}</Text>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon fontSize={'md'} />}
            </Flex>
        </Button>
    )
}

export default ThemeToggleMobile