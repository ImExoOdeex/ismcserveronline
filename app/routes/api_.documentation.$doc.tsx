import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
    Button,
    Code,
    Divider,
    Flex,
    Heading,
    Image,
    Table,
    TableContainer,
    Td,
    Text,
    Th,
    Tr
} from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import fs from "node:fs/promises";
import type { PluggableList } from "node_modules/react-markdown/lib";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { typedjson } from "remix-typedjson";

export async function loader({ request, params }: LoaderFunctionArgs) {
    csrf(request);

    const doc = params.doc as string;

    let markdown = await fs.readFile(`./public/docs/${doc}.md`, "utf-8").then((data) => {
        return data;
    });

    if (doc === "widgets") {
        const url = new URL(request.url);
        const serverParam = url.searchParams.get("server");

        if (serverParam) {
            markdown = markdown.replaceAll("hypixel.net", serverParam);
        }
    }

    return typedjson(
        {
            markdown
        },
        {
            headers: {
                "Cache-Control": "max-age=360, s-maxage=360, stale-while-revalidate=86400"
            }
        }
    );
}
export default function ApiDocumentation() {
    const { markdown } = useAnimationLoaderData<typeof loader>();

    return (
        <Flex flexDir={"column"} gap={4}>
            <Button
                as={Link}
                to={"/api/documentation"}
                size={"lg"}
                w={"fit-content"}
                leftIcon={<ArrowBackIcon />}
                mb={2}
            >
                Back
            </Button>

            <Markdown components={components} remarkPlugins={plugins}>
                {markdown}
            </Markdown>
        </Flex>
    );
}

const components = {
    p: (props) => <Text {...props} />,
    h1: (props) => <Heading mt={10} {...props} size={"md"} />,
    h2: (props) => <Heading {...props} mt={4} fontWeight={600} size={"sm"} />,
    h3: (props) => <Heading {...props} mt={2} fontWeight={500} size={"xs"} />,
    code: (props) => <Code {...props} />,
    hr: (props) => <Divider {...props} />,
    a: (props) => <a {...props} target={"_blank"} rel={"noopener noreferrer"} />,
    table: (props) => (
        <TableContainer>
            <Table {...props} />
        </TableContainer>
    ),
    td: (props) => <Td {...props} />,
    th: (props) => <Th {...props} />,
    tr: (props) => <Tr {...props} />,
    img: (props) => <Image {...props} maxW="400px" my={2} />
} satisfies Partial<Components>;

const plugins = [remarkGfm] satisfies PluggableList;
