import { memo } from "react";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export default memo(function RealTimeConnecting() {
    return (
        <Flex gap={4} flexDir={"column"} alignItems={"center"} mx="auto" mt={10}>
            <Spinner size={"lg"} />
            <Text fontWeight={500}>Connecting to server...</Text>
        </Flex>
    );
});
