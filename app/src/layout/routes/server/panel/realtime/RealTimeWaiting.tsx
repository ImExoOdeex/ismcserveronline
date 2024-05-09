import { memo } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Progress } from "@chakra-ui/progress";

export default memo(function RealTimeWaiting() {
    return (
        <Flex gap={4} flexDir={"column"} alignItems={"center"} w={"100%"} mt={10}>
            <Text fontWeight={500}>Waiting for server...</Text>
            <Progress
                isIndeterminate
                maxW={"300px"}
                w={"100%"}
                bg={"transparent"}
                size={"xs"}
                colorScheme={"brand"}
            />
        </Flex>
    );
});
