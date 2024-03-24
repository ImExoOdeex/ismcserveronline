import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { Flex, Heading } from "@chakra-ui/react";

export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);

	return typedjson(
		{},
		{
			headers: {
				"Cache-Control": "max-age=360, stale-while-revalidate=60"
			}
		}
	);
}

export default function ApiDocumentation() {
	return (
		<Flex>
			<Heading>Server data</Heading>
		</Flex>
	);
}
