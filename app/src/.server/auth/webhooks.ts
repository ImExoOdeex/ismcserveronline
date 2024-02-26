import { getClientIPAddress } from "remix-utils/get-client-ip-address";

type User = {
	id: number;
	email: string;
	nick: string;
	photo: string | null;
};

interface IInfo {
	ip?: string | null;
	platform?: string | null;
	agent?: string | null;
}

function userDisabledLogging(user: User) {
	return [""].includes(user.email);
}

export class Info {
	ip: string | null;
	platform: string | null;
	agent: string | null;

	constructor(headers: Headers) {
		this.ip = getClientIPAddress(headers);
		this.platform = headers.get("sec-ch-ua-platform");
		this.agent = headers.get("user-agent");
	}
}

export async function sendLoginWebhook(user: User, provider: string, info: IInfo) {
	try {
		if (userDisabledLogging(user)) return;
		await fetch(process.env.DISCORD_WEBHOOK_LOGIN!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						title: `User \`${user.nick}\` has logged via ${provider}`,
						description: `**Email**: ${user.email}\n**IP**: ${info.ip}\n**Platform**: ${info.platform}\n**Agent**: ${info.agent}`,
						color: 16777215,
						author: {
							name: user.nick,
							url: `https://discord.com/users/${user.id}`,
							icon_url: user.photo || `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`
						}
					}
				],
				attachments: []
			})
		});
	} catch (e) {
		console.error(e);
	}
}

export async function sendLogoutWebhook(user: User, provider: string, info: IInfo) {
	try {
		if (userDisabledLogging(user)) return;
		await fetch(process.env.DISCORD_WEBHOOK_LOGIN!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						title: `User \`${user.nick}\` has just logged out via ${provider}`,
						description: `**Email**: ${user.email}\n**IP**: ${info.ip}\n**Platform**: ${info.platform}\n**Agent**: ${info.agent}`,
						color: 16777215,
						author: {
							name: user.nick,
							url: `https://discord.com/users/${user.id}`,
							icon_url: user.photo || `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`
						}
					}
				],
				attachments: []
			})
		});
	} catch (e) {
		console.error(e);
	}
}

export async function sendActionWebhook(user: User, action: string, info: IInfo, color: string | number = 16777215) {
	try {
		if (userDisabledLogging(user)) return;
		await fetch(process.env.DISCORD_WEBHOOK_LOGIN!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						title: `User \`${user.nick}\` just made ${action}`,
						description: `**Email**: ${user.email}\n**IP**: ${info.ip}\n**Platform**: ${info.platform}\n**Agent**: ${info.agent}`,
						color,
						author: {
							name: user.nick,
							url: `https://discord.com/users/${user.id}`,
							icon_url: user.photo || `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`
						}
					}
				],
				attachments: []
			})
		});
	} catch (e) {
		console.error(e);
	}
}

export async function sendCommentWebhook(user: User, comment: string, server: string, info: IInfo) {
	try {
		if (userDisabledLogging(user)) return;
		await fetch(process.env.DISCORD_WEBHOOK_LOGIN!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						title: `User \`${user.nick}\` just made new comment`,
						description: `**Email**: ${user.email}\n**IP**: ${info.ip}\n**Platform**: ${info.platform}\n**Agent**: ${info.agent}`,
						fields: [
							{
								name: "Comment",
								value: comment
							},
							{
								name: "Server",
								value: server
							}
						],
						author: {
							name: user.nick,
							url: `https://discord.com/users/${user.id}`,
							icon_url: user.photo || `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`
						}
					}
				],
				attachments: []
			})
		});
	} catch (e) {
		console.error(e);
	}
}

export async function sendDeleteCommentWebhook(user: User, comment: string, server: string, info: IInfo) {
	try {
		if (userDisabledLogging(user)) return;
		await fetch(process.env.DISCORD_WEBHOOK_LOGIN!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						title: `User \`${user.nick}\` deleted their comment`,
						description: `**Email**: ${user.email}\n**IP**: ${info.ip}\n**Platform**: ${info.platform}\n**Agent**: ${info.agent}`,
						fields: [
							{
								name: "Comment",
								value: comment
							},
							{
								name: "Server",
								value: server
							}
						],
						author: {
							name: user.nick,
							url: `https://discord.com/users/${user.id}`,
							icon_url: user.photo || `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`
						}
					}
				],
				attachments: []
			})
		});
	} catch (e) {
		console.error(e);
	}
}

export async function sendReportWebhook(user: User, comment: object, server: string, info: IInfo) {
	try {
		const res = await fetch(process.env.DISCORD_WEBHOOK_REPORT!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: null,
				embeds: [
					{
						title: `User \`${user.nick}\` reported a comment`,
						description: `**Email**: ${user.email}\n**IP**: ${info.ip}\n**Platform**: ${info.platform}\n**Agent**: ${info.agent}`,
						fields: [
							{
								name: "Comment",
								value: JSON.stringify(comment, null, 2)
							},
							{
								name: "Server",
								value: server
							}
						],
						author: {
							name: user.nick,
							url: `https://discord.com/users/${user.id}`,
							icon_url: user.photo || `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`
						}
					}
				],
				attachments: []
			})
		}).then((res) => res.json());
		console.log("res", res);
	} catch (e) {
		console.error(e);
	}
}
