import { csrf } from "@/.server/functions/security.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { eventStream } from 'remix-utils/sse/server';
import type { EventEmitter } from 'node:events';

export interface NewVote {
	id: string;
	nick: string;
}

export function loader({ request, context }: LoaderFunctionArgs) {
	csrf(request);

	throw new Error("Not implemented");

	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	invariant(id, "id is required");

	const eventName = `vote-${id}`;

	return eventStream(request.signal, (send) => {
		console.log("init");
		const emitter = context.emitter as EventEmitter;

		function handle(data: NewVote) {
			console.log("GOT: ", data);
			send({ event: "new-vote", data: JSON.stringify(data) });
		}

		// send({
		// 	event: "init",
		// 	data: JSON.stringify({ id })
		// });

		setInterval(() => {
			send({ event: "time", data: new Date().toISOString() });
		}, 1000);

		emitter.on(eventName, handle);

		return () => {
			console.log("unsubscribing");
			emitter.off(eventName, handle);
		};
	});
}
