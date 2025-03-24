import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import type { MultiEmitter } from "server/MultiEmitter";
import invariant from "tiny-invariant";

export interface NewVote {
    id: string;
    nick: string;
}

export function loader({ request, context }: LoaderFunctionArgs) {
    // csrf(request);

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    invariant(id, "id is required");

    const eventName = `vote-${id}`;

    return eventStream(request.signal, (send) => {
        const emitter = context.emitter as MultiEmitter;

        function handle(data: NewVote) {
            send({ event: "new-vote", data: JSON.stringify(data) });
        }

        emitter.on(eventName, handle);

        const timeout = setTimeout(() => {
            emitter.off(eventName, handle);
        }, 89_000);

        return () => {
            clearTimeout(timeout);
            emitter.off(eventName, handle);
        };
    });
}
