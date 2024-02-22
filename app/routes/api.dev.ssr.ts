import { json, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { secureBotRoute } from "~/components/server/functions/env.server";
import serverConfig from "~/components/server/serverConfig.server";

export async function action({ request }: ActionFunctionArgs) {
	secureBotRoute(request);

	const form = await request.formData();
	const timesForm = form.get("times")?.toString();
	invariant(timesForm, "times is required");
	const times = Number(timesForm);
	const route = form.get("route")?.toString() ?? "empty";
	const origin = form.get("origin")?.toString() ?? serverConfig.dashUrl;

	let fetchesMs = [] as number[];

	const start = Date.now();
	for await (const _ of Array(times)) {
		const res = await fetch(origin + "/" + route);

		const waitingForServerResponse = Number(res.headers.get("x-response-time")?.replace("ms", ""));

		fetchesMs.push(waitingForServerResponse);
	}
	const total = Date.now() - start;
	const average = fetchesMs.reduce((a, b) => a + b, 0) / fetchesMs.length;

	return json({
		// array: fetchesMs,
		totalTime: total + "ms",
		averageTime: average.toFixed(2) + "ms"
	});
}
