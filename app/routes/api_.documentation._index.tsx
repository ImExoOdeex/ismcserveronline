import Link from "@/layout/global/Link";
import { Flex, Heading, Text } from "@chakra-ui/react";

export default function ApiDocumentation() {
    const apis = [
        {
            title: "Server data API",
            description: "Access the data of any server, such as it's status, players, and more.",
            link: "/api/documentation/server-data"
        },
        {
            title: "Votings API",
            description: "Get vote count of your server, overall or some username.",
            link: "/api/documentation/voting"
        },
        {
            title: "Widgets",
            description: "Get cool image of server statuses.",
            link: "/api/documentation/widgets"
        }
    ];

    return (
        <Flex flexDir={"column"} gap={4}>
            <Text>
                We offer a public API for developers to use. It requires tokens generated from the
                dashboard.
            </Text>

            {apis.map((api, index) => (
                <Flex
                    key={index}
                    rounded={"xl"}
                    bg={"alpha"}
                    flexDir={"column"}
                    p={4}
                    gap={2}
                    as={Link}
                    to={api.link}
                >
                    <Heading size={"md"}>{api.title}</Heading>
                    <Text>{api.description}</Text>
                </Flex>
            ))}
        </Flex>
    );
}
