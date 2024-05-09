import { VStack } from "@chakra-ui/react";
import { useOutlet } from "@remix-run/react";

export default function Index() {
    const outlet = useOutlet();

    return (
        <VStack w="100%" align={"start"} spacing={4}>
            {outlet}
        </VStack>
    );
}
