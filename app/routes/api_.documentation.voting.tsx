import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { Button, Code, Divider, Flex, Heading, Table, TableContainer, Td, Text, Th, Tr } from "@chakra-ui/react";
import fs from "fs/promises";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Link from "@/layout/global/Link";
import { ArrowBackIcon } from "@chakra-ui/icons";

export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);

	const markdown = await fs.readFile("./public/docs/voting.md", "utf-8");

	return typedjson(
		{
			markdown
		},
		{
			headers: {
				"Cache-Control": "max-age=360, stale-while-revalidate=60"
			}
		}
	);
}

export default function ApiDocumentation() {
	const { markdown } = useAnimationLoaderData<typeof loader>();
	console.log("markdown", markdown);

	return (
		<Flex flexDir={"column"} gap={4}>
			<Button as={Link} to={"/api/documentation"} size={"lg"} w={"fit-content"} leftIcon={<ArrowBackIcon />} mb={2}>
				Back
			</Button>

			<Markdown
				components={{
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
					tr: (props) => <Tr {...props} />
				}}
				remarkPlugins={[remarkGfm, remarkBreaks]}
			>
				{markdown}
			</Markdown>
		</Flex>
	);
}
