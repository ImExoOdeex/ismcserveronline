import Link from "@/layout/global/Link";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { memo } from "react";

export default memo(function Widget() {
    return (
        <Flex flexDir={"row"} w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
            <Flex flexDir={"column"}>
                <Heading size="md">Image widget</Heading>
                <Text>Wanna get a cool image widget of server status?</Text>
            </Flex>

            <Button as={Link} to={"/api/documentation/widgets"}>
                Get widget
            </Button>
        </Flex>
    );
});
