import { Flex, Button, HStack, Spinner, Box, Text } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { ChakraInput } from "../../MotionComponents"
import { useState } from "react"
import { useFetcher } from "@remix-run/react"

export default function ServerSearchMobile() {
    const [searching, setSearching] = useState<boolean>()
    const [serverValue, setServerValue] = useState<string>()

    const fetcher = useFetcher()
    const submitting = fetcher.state !== 'idle'

    return (
        <fetcher.Form method="post" style={{ width: "100%" }}>
            <Flex pos={'relative'} w={"100%"} flexDir='column'>
                <ChakraInput rounded={'2xl'} placeholder="Hypixel.net" name="server" pl='14px' w='100%'
                    onFocus={() => setSearching(true)} onBlur={() => setSearching(false)}
                    onChange={(e) => setServerValue(e.currentTarget.value)}
                    bg='alpha100' _focus={{ outlineColor: 'transparent', borderColor: 'brand', outlineWidth: 0 }} color='textSec' fontWeight={500}
                    h={'40px'} zIndex={11}
                    // @ts-ignore
                    transition={{ duration: .2, ease: [0.25, 0.1, 0.25, 1] }}
                />

                <Box>
                    <AnimatePresence mode="wait">
                        {(searching || serverValue?.length) &&
                            <motion.div
                                style={{ width: "100%", zIndex: 10, display: 'block', overflow: 'hidden' }}
                                transition={{ duration: .33, ease: [0.25, 0.1, 0.25, 1] }}
                                initial={{ marginTop: '0px', height: 0 }}
                                animate={{ marginTop: '20px', height: "auto" }}
                                exit={{ transition: { duration: .15 }, marginTop: '0px', height: 0 }}
                            >
                                <Button rounded={'2xl'} variant='brand' type='submit' w='100%' zIndex={10}>
                                    <Text px={2}>
                                        Search
                                    </Text>
                                </Button>
                            </motion.div>
                        }
                    </AnimatePresence>
                </Box>



                <AnimatePresence mode="wait">
                    {submitting &&
                        <motion.div
                            style={{ position: 'absolute', top: "0", right: "0", left: "0", bottom: "0", zIndex: "1401" }}
                            transition={{ duration: .33, ease: [0.25, 0.1, 0.25, 1] }}
                            initial={{ opacity: 0, y: "-25%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "-25%" }}
                        >
                            <Flex w='100%' h='100%' bg='bg' align={'center'} alignItems='center' justifyContent={'center'} zIndex={1401}>
                                <HStack>
                                    <Text fontWeight={500} fontSize='sm'>
                                        Getting real-time data about {serverValue}
                                    </Text>
                                    <Spinner size={'sm'} />
                                </HStack>
                            </Flex>
                        </motion.div>
                    }
                </AnimatePresence>


            </Flex>
        </fetcher.Form>
    )
}