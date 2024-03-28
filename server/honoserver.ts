import { PrismaClient } from "@prisma/client";
import cluster from "cluster";
import os from "os";
import { MultiEmitter } from "server/MultiEmitter";
import { HonoApp } from "server/honoapp";
import { WsServer } from "server/wsserver";
import sourceMapSupport from "source-map-support";
import { Logger } from "../app/src/.server/modules/Logger";

sourceMapSupport.install();

if (process.env.NODE_ENV === "production") {
	if (cluster.isPrimary) {
		Logger(`Master ${process.pid} is running`, "magenta", "white");

		Logger(
			'__     ______     __    __     ______     ______     ______     ______     __   __   ______     ______     ______     __   __     __         __     __   __     ______   \n/\\ \\   /\\  ___\\   /\\ "-./  \\   /\\  ___\\   /\\  ___\\   /\\  ___\\   /\\  == \\   /\\ \\ / /  /\\  ___\\   /\\  == \\   /\\  __ \\   /\\ "-.\\ \\   /\\ \\       /\\ \\   /\\ "-.\\ \\   /\\  ___\\  \n\\ \\ \\  \\ \\___  \\  \\ \\ \\-./\\ \\  \\ \\ \\____  \\ \\___  \\  \\ \\  __\\   \\ \\  __<   \\ \\ \\\'/   \\ \\  __\\   \\ \\  __<   \\ \\ \\/\\ \\  \\ \\ \\-.  \\  \\ \\ \\____  \\ \\ \\  \\ \\ \\-.  \\  \\ \\  __\\  \n \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\/\\_____\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\__|    \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\ \\_____\\  \\ \\_\\  \\ \\_\\\\"\\_\\  \\ \\_____\\\n  \\/_/   \\/_____/   \\/_/  \\/_/   \\/_____/   \\/_____/   \\/_____/   \\/_/ /_/   \\/_/      \\/_____/   \\/_/ /_/   \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/   \\/_/ \\/_/   \\/_____/',
			"green",
			"black",
			true
		);

		for (let i = 0; i < os.availableParallelism(); i++) {
			cluster.fork();
		}

		new WsServer(new PrismaClient());

		// resend the message to the rest of the workers except the original sender
		cluster.on("message", (worker, message) => {
			console.log("cluster message: ", message);
			Object.values(cluster?.workers ?? {}).forEach((w) => {
				if (w !== worker) {
					console.log("resending: ", message);
					w?.send(message);
				}
			});
		});

		cluster.on("exit", (worker) => {
			Logger(`Worker ${worker.process.pid} died`, "white", "red");
			cluster.fork();
		});
	} else {
		Logger(`Worker ${process.pid} started`, "blue", "white");

		const emitter = new MultiEmitter();

		// start the app server
		new HonoApp(emitter).run();
	}
} else {
	new HonoApp(new MultiEmitter()).run();
}
