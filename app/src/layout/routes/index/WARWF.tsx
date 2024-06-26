import Link from "@/layout/global/Link";
import { Badge, Flex, Grid, GridItem, HStack, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { BiCode, BiLineChart } from "react-icons/bi";
import { HiStatusOnline } from "react-icons/hi";
import { IoReturnDownForwardOutline } from "react-icons/io5";
import { TbBulb, TbChecks } from "react-icons/tb";

const items = [
    {
        id: 0,
        title: "Minecraft server status",
        description: "Check any Minecraft servers status on both, Java and Bedrock edition!",
        to: "",
        color: "green",
        icon: HiStatusOnline
    },
    {
        id: 1,
        title: "List of most many servers",
        description: "Find your new favourite Premium Minecraft server to play with friends!",
        to: "/search",
        color: "gold",
        icon: BiLineChart
    },
    {
        id: 2,
        title: "Free to use API",
        description: "Use our free-to-use API to get information about every Minecraft server!",
        to: "/api",
        color: "teal",
        icon: BiCode
    },
    {
        id: 3,
        title: "Get information about previous server checks",
        description: "Checks are shown below server information ",
        to: "",
        color: "pink.300",
        icon: TbChecks
    }
];

export default function WARWF() {
    return (
        <VStack w="100%" spacing={10}>
            <VStack w="100%" textAlign={"center"}>
                <Badge
                    bg={"orange.100"}
                    color={"orange.900"}
                    rounded={"full"}
                    px={3}
                    py={1}
                    variant={"solid"}
                >
                    <HStack>
                        <Icon as={TbBulb} boxSize="18px" />
                        <Text fontSize={"xs"}>Go explore!</Text>
                    </HStack>
                </Badge>
                <Heading>What are you waiting for?</Heading>
            </VStack>

            <Grid
                templateColumns={{ base: "repeat(1, 4fr)", md: "repeat(2, 2fr)" }}
                gap={5}
                w="100%"
            >
                {items.map((i) => (
                    <GridItem
                        w="100%"
                        key={i.id}
                        as={Link}
                        to={i.to}
                        rounded={"3xl"}
                        _hover={{ bg: "alpha", textDecoration: "none" }}
                        p={8}
                    >
                        <VStack w="100%" align={"start"} spacing={5}>
                            <Flex rounded={"xl"} bg="alpha" p={2} boxSize={"12"}>
                                <Icon boxSize={"100%"} as={i.icon} color={i.color} />
                            </Flex>

                            <Heading fontSize={"xl"}>{i.title}</Heading>
                            <Text fontSize={"sm"} color="textSec">
                                {i.description}
                            </Text>
                            <HStack>
                                <Text fontWeight={"600"} color={"brand"}>
                                    Explore
                                </Text>
                                <Icon
                                    boxSize={"24px"}
                                    color={"brand"}
                                    as={IoReturnDownForwardOutline}
                                />
                            </HStack>
                        </VStack>
                    </GridItem>
                ))}
            </Grid>
        </VStack>
    );
}
