import { Button, HStack, Icon, Link, Text } from "@chakra-ui/react";
import { BiCode } from 'react-icons/bi'

export default function APIButton() {
    return (
        <Link href="https://awdadada.awda" _hover={{ textDecor: 'none' }}>
            <Button
                _hover={{ bg: "alpha" }} _active={{ bg: "alpha100" }}
                rounded={'xl'} display={{ base: 'none', lg: 'flex' }} bg={'transparent'}
            >
                <HStack spacing={1}>
                    <Text fontWeight={600}>API</Text>
                    <Icon as={BiCode} />
                </HStack>
            </Button>
        </Link>
    )
}