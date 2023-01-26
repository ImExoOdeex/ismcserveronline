import { Divider, Heading, Text, VStack } from "@chakra-ui/react";

export default function HowToUse() {
    return (
        <VStack spacing={5} width={"100%"} align={"start"} mb={10}>
            <Heading as={"h1"} fontSize={"xl"}>How to use this tool?</Heading>
            <Divider />
            <Text>
                Simply enter the server address you want to check in input and click <b>Search</b> button. The fetching state shouldn't take more than 5 seconds.
            </Text>
        </VStack>
    )
}