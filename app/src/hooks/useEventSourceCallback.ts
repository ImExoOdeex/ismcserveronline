import { useEffect } from "react";
import type { EventSourceOptions } from "remix-utils/sse/react";
import { useEventSource } from "remix-utils/sse/react";

export default function useEventSourceCallback(
    url: string | URL,
    eventSourceOptions?: EventSourceOptions,
    callback?: (data: any) => void
) {
    const eventSource = useEventSource(url, eventSourceOptions);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!eventSource) return;

        let e: any;
        try {
            e = JSON.parse(eventSource);
        } catch (_error) {
            console.warn(
                `Error parsing eventSource to JSON. it's a ${typeof eventSource}.`,
                eventSource
            );
            e = eventSource;
            return;
        }

        callback?.(e);
    }, [eventSource]);

    return eventSource;
}
