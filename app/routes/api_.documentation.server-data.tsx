import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Link from "@/layout/global/Link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Code, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import fs from "fs/promises";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { typedjson } from "remix-typedjson";

export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);

	const markdown = await fs.readFile("./public/docs/server-data.md", "utf-8").then((data) => {
		return data;
	});

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
					a: (props) => <a {...props} target={"_blank"} rel={"noopener noreferrer"} />
				}}
				remarkPlugins={[remarkGfm]}
			>
				{markdown}
			</Markdown>
		</Flex>
	);
}
