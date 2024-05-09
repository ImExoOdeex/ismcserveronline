import serverConfig from "@/.server/serverConfig";
import crypto from "node:crypto";
import { decrypt } from "./encryption";
import TCPClient from "./tcp";

export async function sendVoteWebhook(
    foundServer: { vote_webhook_url: string | null; vote_webhook_password: string | null },
    { server, nick, bedrock }: { server: string; bedrock: boolean; nick: string }
) {
    if (!foundServer.vote_webhook_url || !foundServer.vote_webhook_password) return;

    await fetch(foundServer.vote_webhook_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: await decrypt(foundServer.vote_webhook_password),
            "X-Forwarded-For": "",
            "X-Real-IP": "",
            Origin: serverConfig.redirectUrl
        },
        body: JSON.stringify({
            message: `User ${nick} has voted for ${server}!`,
            bedrock,
            server,
            nick
        })
    });
}

interface VotifierVote {
    host: string;
    port: number;
    token: string;
    nick: string;
}

// Credit: https://github.com/PassTheMayo/minecraft-server-util/blob/master/src/sendVote.ts
export async function sendVotePacket({ host, nick, port, token }: VotifierVote): Promise<void> {
    return new Promise(async (resolve, reject) => {
        let socket: TCPClient | undefined = undefined;

        const timeout = setTimeout(() => {
            socket?.close();

            reject(new Error("Server is offline or unreachable"));
        }, 5000);

        try {
            socket = new TCPClient();

            await socket.connect({ host, port, timeout: 5000 });

            // let challengeToken;

            // Handshake packet
            // https://github.com/NuVotifier/NuVotifier/wiki/Technical-QA#handshake
            {
                const version = await socket.readStringUntil(0x0a);
                const split = version.split(" ");

                if (split[0] !== "VOTIFIER" && split[0] !== "VOTIFIERPLUS")
                    throw new Error(
                        "Not connected to a Votifier server. Expected VOTIFIER or VOTIFIERPLUS in handshake, received: " +
                            version
                    );
            }

            // Send vote packet
            // https://github.com/NuVotifier/NuVotifier/wiki/Technical-QA#protocol-v1
            {
                const timestamp = Date.now();
                const address = host + ":" + port;

                const publicKey = `-----BEGIN PUBLIC KEY-----\n${token}\n-----END PUBLIC KEY-----\n`;
                const vote = `VOTE\n${"ismcserver.online"}\n${nick}\n${address}\n${timestamp}\n`;

                const encryptedPayload = crypto.publicEncrypt(
                    {
                        key: publicKey,
                        padding: crypto.constants.RSA_PKCS1_PADDING
                    },
                    Buffer.from(vote)
                );

                socket.writeBytes(encryptedPayload);
                await socket.flush(false);
            }

            {
                clearTimeout(timeout);

                socket.close();

                resolve();
            }
        } catch (e) {
            clearTimeout(timeout);

            socket?.close();

            reject("catched error: " + e);
        }
    });
}
