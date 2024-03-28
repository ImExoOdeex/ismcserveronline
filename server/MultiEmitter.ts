import { EventEmitter } from "node:events";

export class MultiEmitter extends EventEmitter {
	constructor() {
		super();

		process.on("message", (msg: any) => {
			console.log("WORKER MSG: ", msg);
			if ("event" in msg && "data" in msg) {
				console.log("EMITTING: ", msg.event, msg.data);
				this.emit(msg.event, msg.data);
			}
		});
	}

	public send(event: string, data: Record<string, any>) {
		process?.send?.({ event, data });
		console.log("SEND: ", { event, data });
		this.emit(event, data);
	}
}
