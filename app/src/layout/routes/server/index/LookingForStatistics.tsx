import Link from "@/layout/global/Link";
import { Box, Button, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import { memo } from "react";

export default memo(function LFS() {
    return (
        <Flex
            flexDir={"row"}
            w={"100%"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={10}
        >
            <Flex flexDir={"column"} gap={1}>
                <Heading size="md">Looking for easy access to your server?</Heading>
                <Text>
                    Install{" "}
                    <Box
                        as="span"
                        bgClip={"text"}
                        bgGradient={"linear(to-r, #8167d9, #e380a4)"}
                        fontWeight={600}
                    >
                        IMCSO Insight
                    </Box>{" "}
                    plugin on a verified server and see system usage with the server's console
                    directly on our website.
                </Text>
            </Flex>

            <HStack>
                <Button as={Link} to={"/plugin"}>
                    Plugin
                </Button>
            </HStack>
        </Flex>
    );
});
