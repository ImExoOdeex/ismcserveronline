import serverConfig from "@/.server/serverConfig";
import { decrypt } from "./encryption";

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
