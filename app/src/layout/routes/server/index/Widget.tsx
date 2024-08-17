import Link from "@/layout/global/Link";
import { Button, Flex, type FlexProps, HStack, Heading, Text, useToast } from "@chakra-ui/react";
import { useParams } from "@remix-run/react";
import { memo, useCallback } from "react";

interface Props extends FlexProps {}

export default memo(function Widget(props: Props) {
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
        <Flex
            flexDir={{
                base: "column",
                md: "row"
            }}
            w={"100%"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={4}
            {...props}
        >
            <Flex flexDir={"column"}>
                <Heading size="md">Image widget</Heading>
                <Text>Wanna get a cool image widget of server status?</Text>
            </Flex>

            <HStack
                w={{
                    base: "100%",
                    md: "auto"
                }}
            >
                <Button
                    as={Link}
                    to={`/api/documentation/widgets?server=${server}`}
                    w={{
                        base: "100%",
                        md: "auto"
                    }}
                >
                    Widget docs
                </Button>
                <Button
                    w={{
                        base: "100%",
                        md: "auto"
                    }}
                    onClick={copyWidgetLink}
                >
                    Copy widget link
                </Button>
            </HStack>
        </Flex>
    );
});
