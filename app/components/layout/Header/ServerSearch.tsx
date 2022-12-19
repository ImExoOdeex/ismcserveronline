import { Search2Icon } from "@chakra-ui/icons";
import { Box, chakra, Flex, HStack, shouldForwardProp, Spinner, Text } from "@chakra-ui/react";
import { AnimatePresence, isValidMotionProp, motion } from "framer-motion";
import { useState } from "react";
import { useFetcher } from "@remix-run/react";

const ChakraInput = chakra(motion.input, {
    shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

export default function ServerSearch() {
    const [searching, setSearching] = useState(false)

    const variants = {
        close: {
            paddingLeft: '26px',
        },
        open: {
            paddingLeft: '10px',
        },
    }

    const fetcher = useFetcher()
    const submitting = fetcher.state !== 'idle'

    return (
        <fetcher.Form method="post" style={{ position: 'relative', overflow: 'hidden' }}>
            <Flex w='200%' h='30px' overflow='hidden'>

                <AnimatePresence mode="wait">
                    {submitting &&
                        <motion.div
                            style={{ position: 'absolute', top: "0", right: "0", left: "0", bottom: "0" }}
                            transition={{ duration: .33, ease: [0.25, 0.1, 0.25, 1] }}
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                        >
                            <Flex w='100%' h='100%' bg='bg' align={'center'} alignItems='center' justifyContent={'center'}>
                                <HStack>
                                    <Text fontWeight={500} fontSize='sm'>
                                        Getting real-time data
                                    </Text>
                                    <Spinner size={'sm'} />
                                </HStack>
                            </Flex>
                        </motion.div>
                    }
                </AnimatePresence>

                <ChakraInput as={motion.input} h='100%' w='200px' rounded='xl' bg='alpha100' placeholder="Server" onFocus={() => setSearching(true)} onBlur={() => setSearching(false)}
                    variants={variants} animate={searching ? "open" : "close"} pl={'26px'} _focus={{ outlineColor: 'transparent', outlineWidth: 0 }} color='textSec' fontWeight={500}
                    // @ts-ignore
                    transition={{ ease: [0.25, 0.1, 0.25, 1], duration: .3 }}
                    name="server"
                />

                <Box pos={'absolute'} h='100%' top="10%" translateY={"-50%"} left={2}>
                    <AnimatePresence mode="wait">
                        {!searching &&
                            <motion.div transition={{ duration: .3, ease: [0.25, 0.1, 0.25, 1] }}
                                exit={{ opacity: 0, x: -20, scale: 0.7 }}
                                animate={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: -20 }}

                            >
                                <Search2Icon color={'chakra-placeholder-color'} fontSize='12px' />
                            </motion.div>
                        }
                    </AnimatePresence>
                </Box>

            </Flex>
        </fetcher.Form>
    )
}