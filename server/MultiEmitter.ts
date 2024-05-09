import { EventEmitter } from "node:events";

export class MultiEmitter extends EventEmitter {
	constructor() {
		super();

		process.on("message", (msg: unknown) => {
			console.log("WORKER MSG: ", msg);
			if (
				typeof msg !== "object" ||
				msg === null ||
				!("event" in msg) ||
				!("data" in msg) ||
				typeof msg.event !== "string"
			) {
				console.error("Invalid message from worker: ", msg);
				return;
			}

			console.log("EMITTING: ", msg.event, msg.data);
			this.emit(msg.event, msg.data);
		});
	}

	public send(event: string, data: Record<string, unknown>) {
		process?.send?.({ event, data });
		console.log("SEND: ", { event, data });
		this.emit(event, data);
	}
}
