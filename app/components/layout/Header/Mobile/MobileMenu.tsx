import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, CloseButton, Flex, VStack, HStack, Link as ChakraLink, Icon } from "@chakra-ui/react"
import ThemeToggleMobile from "./ThemeToggleMobile"
import ServerSearchMobile from "./ServerSearchMobile"
import { useLocation } from "@remix-run/react"
import { useEffect } from "react"
import Link from "~/components/utils/Link"
import { BiCode } from "react-icons/bi"
import { QuestionOutlineIcon } from "@chakra-ui/icons"

type Props = { isOpen: boolean, onOpen: () => void, onClose: () => void }

export default function MobileMenu({ isOpen, onClose, onOpen }: Props) {

    const path = useLocation().pathname

    useEffect(() => {
        onClose()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path])

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent bg='bg' >
                <ModalHeader>
                    <Flex flexDir={'row'} justifyContent='space-between' w='100%'>
                        <Text>Menu</Text>
                        <CloseButton onClick={onClose} />
                    </Flex>
                </ModalHeader>

                <ModalBody>
                    <VStack spacing={5}>
                        <ThemeToggleMobile isOpen={isOpen} />
                        <ServerSearchMobile />
                    </VStack>
                    <HStack w='100%' justifyContent={'space-between'} mt={6}>
                        <Link to='/faq' w='50%' prefetch="render">
                            <HStack spacing={1.5} justifyContent={'center'} alignItems='center'>
                                <Text fontWeight={600}>FAQ</Text>
                                <QuestionOutlineIcon />
                            </HStack>
                        </Link>
                        <ChakraLink href="https://rapidapi.com/odeex722-TbH352Ij4z/api/minecraft-server-data/" target={'_blank'}
                            w='50%'
                        >
                            <HStack spacing={1.5} justifyContent={'center'} alignItems='center'>
                                <Text fontWeight={600}>API</Text>
                                <Icon as={BiCode} />
                            </HStack>
                        </ChakraLink>
                    </HStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='brand' color={'white'} w='100%' onClick={onClose} rounded='2xl'>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    )
}