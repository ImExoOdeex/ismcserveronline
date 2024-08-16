import { PrismaClient } from "@prisma/client";
import cluster from "node:cluster";
import os from "node:os";
import { ExpressApp } from "server/ExpressApp";
import { MultiEmitter } from "server/MultiEmitter";
import { WsServer } from "server/WsServer";
import { sendExplosion } from "server/explosions";
import { Logger } from "../app/src/.server/modules/Logger";

if (process.env.NODE_ENV === "production") {
    if (cluster.isPrimary) {
        Logger(`Master ${process.pid} is running`, "magenta", "white");

        Logger(
            '__     ______     __    __     ______     ______     ______     ______     __   __   ______     ______     ______     __   __     __         __     __   __     ______   \n/\\ \\   /\\  ___\\   /\\ "-./  \\   /\\  ___\\   /\\  ___\\   /\\  ___\\   /\\  == \\   /\\ \\ / /  /\\  ___\\   /\\  == \\   /\\  __ \\   /\\ "-.\\ \\   /\\ \\       /\\ \\   /\\ "-.\\ \\   /\\  ___\\  \n\\ \\ \\  \\ \\___  \\  \\ \\ \\-./\\ \\  \\ \\ \\____  \\ \\___  \\  \\ \\  __\\   \\ \\  __<   \\ \\ \\\'/   \\ \\  __\\   \\ \\  __<   \\ \\ \\/\\ \\  \\ \\ \\-.  \\  \\ \\ \\____  \\ \\ \\  \\ \\ \\-.  \\  \\ \\  __\\  \n \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\/\\_____\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\__|    \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\ \\_____\\  \\ \\_\\  \\ \\_\\\\"\\_\\  \\ \\_____\\\n  \\/_/   \\/_____/   \\/_/  \\/_/   \\/_____/   \\/_____/   \\/_____/   \\/_/ /_/   \\/_/      \\/_____/   \\/_/ /_/   \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/   \\/_/ \\/_/   \\/_____/',
            "green",
            "black",
            true
        );

        const workers = new Set<number>();

        for (let i = 0; i < os.availableParallelism(); i++) {
            const worker = cluster.fork();
            worker.on("online", () => {
                Logger(`Worker ${worker.process.pid} started`, "blue", "white");
                worker.process.pid && workers.add(worker.process.pid);
            });
        }

        new WsServer(new PrismaClient());

        // resend the message to the rest of the workers except the original sender
        cluster.on("message", (worker, message) => {
            console.log("cluster message: ", message);
            for (const w of Object.values(
                cluster?.workers ?? ({} as NodeJS.Dict<Worker | undefined>)
            )) {
                if (w !== worker) {
                    console.log("resending: ", message);
                    w?.send(message);
                }
            }
        });

        cluster.on("exit", (worker, code) => {
            Logger(`Worker ${worker.process.pid} died`, "white", "red");
            cluster.fork();
            worker.process.pid && workers.delete(worker.process.pid);
            sendExplosion(code, workers.size);
        });
    } else {
        // Logger(`Worker ${process.pid} started`, "blue", "white");

        new ExpressApp(new MultiEmitter()).run();
    }
} else {
    new WsServer(new PrismaClient());
    new ExpressApp(new MultiEmitter()).run();
}
