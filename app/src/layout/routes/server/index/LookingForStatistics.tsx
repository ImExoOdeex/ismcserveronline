import Link from "@/layout/global/Link";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { memo } from "react";
import { LuPlug2 } from "react-icons/lu";

export default memo(function LFS() {
    return (
        <Flex
            flexDir={"column"}
            w={"100%"}
            justifyContent={"space-between"}
            gap={5}
            p={4}
            rounded={"lg"}
            bg={"alpha"}
            alignItems={"flex-start"}
        >
            <Flex flexDir={"column"} gap={2}>
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

            <Button as={Link} to={"/plugin"} px={6} rightIcon={<LuPlug2 />}>
                Plugin
            </Button>
        </Flex>
    );
});
