import { useEffect, useState } from 'react'
import { Button, Flex, Text, Image, LightMode, Stack, Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoaderData } from '@remix-run/react';

function CookieConsent() {

    const { cookies } = useLoaderData()

    const name = "cookieConsent"
    const [isCookieConsent, setIsCookieConsent] = useState(true);

    useEffect(() => {
        const storage = localStorage.getItem(name)
        if (storage == "true") {
            setIsCookieConsent(true)
        } else {
            setIsCookieConsent(false)
        }
    }, [])

    function accept() {
        localStorage.setItem(name, "true")
        setIsCookieConsent(true)
    }

    return (
        <AnimatePresence>
            {!isCookieConsent &&
                <motion.div
                    exit={{ height: 0, transition: { ease: 'easeInOut' } }}
                    style={{ overflow: 'hidden', display: 'block' }}
                >
                    <Box fontWeight={'500'} py={[5, 5, 7]} h={'auto'} w='100%' bg={'brand.900'}
                        display='flex' color="white" px={[2, 2, 5]} justifyContent='space-around' flexDir={['column', 'column', 'row']} alignItems='center'>
                        <LightMode>
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={[3, 5, 10]} alignItems={'center'}>
                                <Image src={'/cookies.png'} w={'70px'} alt="cookies" />
                                <Text alignItems={'center'}>
                                    This site uses third-party cookies. If you don't agree using them, you should close this page now.
                                </Text>
                            </Stack>

                            <Flex alignItems={'center'} justifyItems='center' justifyContent='center'
                                mt={[4, 2, 0]} w={['100%', '100%', 'unset']}>
                                <Button onClick={accept} fontStyle={'normal'} fontWeight='600'
                                    bg='white' color={'blackAlpha.800'}
                                    mx={{ base: `auto !important`, md: 'unset' }}
                                    w={{ base: '75%', md: 'unset' }}>
                                    <Text mx={5}>Accept</Text>
                                </Button>
                            </Flex>
                        </LightMode>
                    </Box>
                </motion.div>
            }
        </AnimatePresence >
    )
}
export default CookieConsent