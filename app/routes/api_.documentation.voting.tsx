import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { Button, Code, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import fs from "fs/promises";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Link from "@/layout/global/Link";
import { ArrowBackIcon } from "@chakra-ui/icons";

export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);

	const markdown = await fs.readFile("./public/docs/server-data.md", "utf-8");

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

	let md = markdown.replace(/```[\s\S]*?```/g, (m) => m.replace(/\n/g, "\n "));
	md = md.replace(/(?<=\n\n)(?![*-])\n\n/g, "&nbsp;\n ");

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
					h3: (props) => <Heading {...props} fontWeight={500} size={"xs"} />,
					code: (props) => <Code {...props} />,
					hr: (props) => <Divider {...props} />,
					a: (props) => <a {...props} target={"_blank"} rel={"noopener noreferrer"} />
				}}
				remarkPlugins={[remarkGfm, remarkBreaks]}
			>
				{md}
			</Markdown>
		</Flex>
	);
}
