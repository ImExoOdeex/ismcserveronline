import { Button, HStack, Icon, Link, Text } from "@chakra-ui/react";
import { BiCode } from 'react-icons/bi'

export default function APIButton() {
    return (
        <Link href="https://rapidapi.com/odeex722-TbH352Ij4z/api/minecraft-server-data/" target={'_blank'} _hover={{ textDecor: 'none' }}>
            <Button
                _hover={{ bg: "alpha" }} _active={{ bg: "alpha100" }}
                rounded={'xl'} bg={'transparent'}
            >
                <HStack spacing={1.5}>
                    <Text fontWeight={600}>API</Text>
                    <Icon as={BiCode} />
                </HStack>
            </Button>
        </Link>
    )
}