import os from "node:os";

export async function sendExplosion(code: number, workersLeft: number) {
    return await fetch(process.env.DISCORD_WEBHOOK_EXPLOSION as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: null,
            embeds: [
                {
                    title: `ismcserver.online worker has exploded with code ${code} :boom:`,
                    description: `**Workers left**: ${workersLeft}/${os.availableParallelism()}`,
                    color: 65400
                }
            ],
            attachments: []
        })
    });
}
