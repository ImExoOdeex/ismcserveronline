import { Badge, Button, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { BiCode } from 'react-icons/bi'
import Link from "~/components/utils/Link";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import { type loader } from "~/routes";

export default function APIButton() {

    let { cookies } = useLoaderData<typeof loader | any>()
    if (typeof document !== "undefined") {
        cookies = document.cookie
    }

    const hasSeen = getCookieWithoutDocument("hasSeenNew", cookies) == "true" ? true : false

    return (
        <Link to="/api" _hover={{ textDecor: 'none' }}
            transform={'auto-gpu'} _active={{ scale: .9 }}
        >
            <Button
                _hover={{ bg: "alpha" }} _active={{ bg: "alpha100" }}
                rounded={'xl'} bg={'transparent'} tabIndex={-1}
            >
                <Flex flexDir={'row'}>
                    <HStack spacing={1.5}>
                        <Text fontWeight={600}>API</Text>
                        <Icon as={BiCode} />
                    </HStack>
                    <AnimatePresence mode="wait" initial={false}>
                        {!hasSeen &&
                            <motion.div
                                style={{ display: 'block', overflow: 'hidden', marginLeft: "4px" }}
                                initial={{ width: 0, paddingLeft: '0px' }}
                                animate={{ width: "auto", paddingLeft: '4px' }}
                                exit={{ width: 0, paddingLeft: '0px' }}
                                transition={{ ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                <Badge colorScheme="green" variant={"subtle"} rounded={'sm'}>new!</Badge>
                            </motion.div>
                        }
                    </AnimatePresence>
                </Flex>
            </Button>
        </Link >
    )
}