import cache from "../app/src/.server/db/redis";
import { Logger } from "../app/src/.server/modules/Logger";

export default async function connectDatabases() {
    Logger("Connecting to the database and redis", "green", "black");
    await cache
        .connect()
        .then(() => {
            Logger(`Worker ${process.pid} Connected to the redis`, "green", "black");
        })
        .catch((e) => {
            Logger(
                `Worker ${process.pid} Failed to connect to the redis: ${e.message}`,
                "red",
                "black"
            );
        });

    await import("../app/src/.server/db/db")
        .then((m) => m.db)
        .then(async (db) => {
            await db.$connect().then(() => {
                Logger(`Worker ${process.pid} Connected to the database`, "green", "black");
            });
        });
}
