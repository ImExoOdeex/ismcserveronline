import cron from "node-cron";
import cluster from "node:cluster";
import os from "node:os";
import { Logger } from "../app/src/.server/modules/Logger";
import { sendExplosion } from "./explosions";
import { WsServer } from "./WsServer";
import { db } from "@/.server/db/db";

if (!cluster.isPrimary) {
  throw new Error("This script should only be run as a master process");
}

Logger(`Master ${process.pid} is running`, "magenta", "white");

Logger(
  '__     ______     __    __     ______     ______     ______     ______     __   __   ______     ______     ______     __   __     __         __     __   __     ______   \n/\\ \\   /\\  ___\\   /\\ "-./  \\   /\\  ___\\   /\\  ___\\   /\\  ___\\   /\\  == \\   /\\ \\ / /  /\\  ___\\   /\\  == \\   /\\  __ \\   /\\ "-.\\ \\   /\\ \\       /\\ \\   /\\ "-.\\ \\   /\\  ___\\  \n\\ \\ \\  \\ \\___  \\  \\ \\ \\-./\\ \\  \\ \\ \\____  \\ \\___  \\  \\ \\  __\\   \\ \\  __<   \\ \\ \\\'/   \\ \\  __\\   \\ \\  __<   \\ \\ \\/\\ \\  \\ \\ \\-.  \\  \\ \\ \\____  \\ \\ \\  \\ \\ \\-.  \\  \\ \\  __\\  \n \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\/\\_____\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\__|    \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\ \\_____\\  \\ \\_\\  \\ \\_\\\\"\\_\\  \\ \\_____\\\n  \\/_/   \\/_____/   \\/_/  \\/_/   \\/_____/   \\/_____/   \\/_____/   \\/_/ /_/   \\/_/      \\/_____/   \\/_/ /_/   \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/   \\/_/ \\/_/   \\/_____/',
  "green",
  "black",
  true
);

const workers = new Set<number>();

cluster.setupPrimary({
  exec: "./build/server/ExpressApp.js",
  stdio: ["inherit", "inherit", "inherit", "ipc"],
});

for (let i = 0; i < os.availableParallelism(); i++) {
  const worker = cluster.fork();
  worker.on("online", () => {
    Logger(`Worker ${worker.process.pid} started`, "blue", "white");
    worker.process.pid && workers.add(worker.process.pid);
  });
}

new WsServer(db);

cluster.on("exit", (worker, code) => {
  Logger(`Worker ${worker.process.pid} died`, "white", "red");
  cluster.fork();
  worker.process.pid && workers.delete(worker.process.pid);
  sendExplosion(code, workers.size);
});

cron.schedule("0 0 1 * *", async () => {
  await db.server.updateMany({
    data: {
      votes_month: 0,
    },
  });
});
