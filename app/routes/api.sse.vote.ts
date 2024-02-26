import { csrf } from "@/.server/functions/security.server";
import { emitter } from "@/.server/sse/emitter";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import invariant from "tiny-invariant";

export interface NewVote {
	id: string;
	nick: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
	csrf(request);
	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	invariant(id, "id is required");

	const eventName = `vote-${id}`;

	return eventStream(request.signal, (send) => {
		function handle(vote: NewVote) {
			send({ event: "new-vote", data: JSON.stringify(vote) });
		}

		emitter.on(eventName, handle);

		return () => {
			emitter.off(eventName, handle);
		};
	});
}
