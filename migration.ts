import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const db = new PrismaClient();

// count votes in the current month for each server and update the votes_month field
const servers = await db.server.findMany();

for (const server of servers) {
    const votes = await db.vote.count({
        where: { server_id: server.id, created_at: { gte: dayjs().startOf("month").toDate() } }
    });
    if (votes > 0) {
        console.log(`${server.server} has ${votes} votes in the current month`);
        await db.server.update({
            where: { id: server.id },
            data: { votes_month: votes }
        });
    }
}

console.log("done");
process.exit(0);
