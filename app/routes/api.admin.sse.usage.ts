import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { getCpuUsage } from "@/.server/modules/usage";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { EventStream } from "@remix-sse/server";
import os from "node:os";

export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);

    const user = await getUser(request, {
        role: true
    });
    if (!user || !user.role) {
        return new Response("Unauthorized", {
            status: 401
        });
    }

    async function constructData() {
        const cpuUsage = await getCpuUsage();

        return {
            cpu: cpuUsage,
            memory: {
                total: convertToMB(os.totalmem()),
                used: convertToMB(os.totalmem() - os.freemem())
            }
        };

        function convertToMB(bytes: number): number {
            return Math.round(bytes / (1024 * 1024));
        }
    }

    try {
        return new EventStream(request, (send) => {
            async function handle() {
                console.log("aborted", request.signal.aborted);
                if (!request.signal.aborted) {
                    const data = await constructData();
                    console.log("handle", data);
                    send(JSON.stringify(data), {
                        channel: "usage"
                    });
                }
            }

            const interval = setInterval(async () => {
                await handle();
            }, 250);

            return () => {
                // Return a cleanup function
                clearInterval(interval);
            };
        });
    } catch (e) {
        console.error(e);
        return new Response("Internal Server Error", {
            status: 500
        });
    }
}
