import { PrismaClient } from "@prisma/client";
import cluster from "cluster";
import os from "os";
import { HonoApp } from "server/honoapp";
import { WsServer } from "server/wsserver";
import sourceMapSupport from "source-map-support";
import { Logger } from "../app/src/.server/modules/Logger";

sourceMapSupport.install();

if (cluster.isPrimary) {
	Logger(`Master ${process.pid} is running`, "magenta", "white");

	Logger(
		'__     ______     __    __     ______     ______     ______     ______     __   __   ______     ______     ______     __   __     __         __     __   __     ______   \n/\\ \\   /\\  ___\\   /\\ "-./  \\   /\\  ___\\   /\\  ___\\   /\\  ___\\   /\\  == \\   /\\ \\ / /  /\\  ___\\   /\\  == \\   /\\  __ \\   /\\ "-.\\ \\   /\\ \\       /\\ \\   /\\ "-.\\ \\   /\\  ___\\  \n\\ \\ \\  \\ \\___  \\  \\ \\ \\-./\\ \\  \\ \\ \\____  \\ \\___  \\  \\ \\  __\\   \\ \\  __<   \\ \\ \\\'/   \\ \\  __\\   \\ \\  __<   \\ \\ \\/\\ \\  \\ \\ \\-.  \\  \\ \\ \\____  \\ \\ \\  \\ \\ \\-.  \\  \\ \\  __\\  \n \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\/\\_____\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\__|    \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\ \\_____\\  \\ \\_\\  \\ \\_\\\\"\\_\\  \\ \\_____\\\n  \\/_/   \\/_____/   \\/_/  \\/_/   \\/_____/   \\/_____/   \\/_____/   \\/_/ /_/   \\/_/      \\/_____/   \\/_/ /_/   \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/   \\/_/ \\/_/   \\/_____/',
		"green",
		"black",
		true
	);

	if (process.env.NODE_ENV === "production") {
		for (let i = 0; i < os.availableParallelism(); i++) {
			cluster.fork();
		}
	} else {
		cluster.fork();
	}

	new WsServer(new PrismaClient());

	cluster.on("exit", (worker) => {
		Logger(`Worker ${worker.process.pid} died`, "white", "red");
		cluster.fork();
	});
} else {
	Logger(`Worker ${process.pid} started`, "blue", "white");

	// start the app server
	new HonoApp().run();
}
