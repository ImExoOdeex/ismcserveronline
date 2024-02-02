import type { LoaderFunctionArgs } from "@remix-run/node";
import { InsideErrorBoundary } from "~/document";

export async function loader(_: LoaderFunctionArgs) {
	throw new Response("Not found", {
		status: 404
	});
}

export default function () {
	return <ErrorBoundary />;
}

export function ErrorBoundary() {
	return <InsideErrorBoundary />;
}
