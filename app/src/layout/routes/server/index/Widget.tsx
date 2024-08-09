import Link from "@/layout/global/Link";
import { Button, Flex, HStack, Heading, Text, useToast } from "@chakra-ui/react";
import { useParams } from "@remix-run/react";
import { memo, useCallback } from "react";

export default memo(function Widget() {
    const toast = useToast();
    const { server } = useParams();

    const copyWidgetLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href + "/widget").then(() => {
            toast({
                title: "Copied widget link to clipboard",
                status: "success",
                duration: 2000
            });
        });
    }, [toast]);

    return (
        <Flex flexDir={"row"} w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
            <Flex flexDir={"column"}>
                <Heading size="md">Image widget</Heading>
                <Text>Wanna get a cool image widget of server status?</Text>
            </Flex>

            <HStack>
                <Button as={Link} to={`/api/documentation/widgets?server=${server}`}>
                    Widget docs
                </Button>
                <Button onClick={copyWidgetLink}>Copy widget link</Button>
            </HStack>
        </Flex>
    );
});
