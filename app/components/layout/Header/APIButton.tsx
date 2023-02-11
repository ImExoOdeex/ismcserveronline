import { Badge, Button, HStack, Icon, Text } from "@chakra-ui/react";
import { BiCode } from 'react-icons/bi'
import Link from "~/components/utils/Link";

export default function APIButton() {
    return (
        <Link to="/api" _hover={{ textDecor: 'none' }}
            transform={'auto-gpu'} _active={{ scale: .9 }}
        >
            <Button
                _hover={{ bg: "alpha" }} _active={{ bg: "alpha100" }}
                rounded={'xl'} bg={'transparent'} tabIndex={-1}
            >
                <HStack spacing={1.5}>
                    <Text fontWeight={600}>API</Text>
                    <Icon as={BiCode} />
                    <Badge colorScheme="green" variant={"subtle"} rounded={'sm'}>new!</Badge>
                </HStack>
            </Button>
        </Link >
    )
}