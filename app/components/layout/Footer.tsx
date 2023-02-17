import { HStack, Stack, Text } from "@chakra-ui/react";
import pack from "../../../package.json"

export default function Footer() {
    return (
        <Stack direction={{ base: "column", md: 'row' }} mx='auto' w='100%' maxW={"1200px"} justifyContent={'space-between'} as={"footer"} fontWeight={"normal"} my={2} px={4} letterSpacing={"1px"}>
            <HStack>
                <Text >
                    version {pack.version}
                </Text>
            </HStack>
            <HStack>
                <Text>
                    Made with {`<3`} by imexoodeex
                </Text>
            </HStack>
        </Stack>
    )
}