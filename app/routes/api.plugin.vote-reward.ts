import { db } from "@/.server/db/db";
import { invariant } from "@/functions/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";

export async function action({ request }: ActionFunctionArgs) {
	try {
		const token = request.headers.get("Authorization")?.trim();
		invariant(token, "Authorization header not found.");

		const foundToken = await db.serverToken.findUnique({
			where: {
				token
			},
			select: {
				token: true
			}
		});
		invariant(foundToken, "Token is not valid.");

		// /api/plugin/vote-reward
		const form = await request.formData();
		const nick = form.get("nick")?.toString().trim();
		invariant(nick, "Nick not found in search params.");

		const hasVotedInLast12Hours = await db.vote.findFirst({
			where: {
				nick,
				created_at: {
					gte: dayjs().subtract(12, "hour").toDate()
				}
			},
			orderBy: {
				created_at: "desc"
			},
			select: {
				id: true,
				nick: true,
				reward_collected: true
			}
		});

		invariant(!hasVotedInLast12Hours?.reward_collected, "User has already collected the reward for the last vote.");
		invariant(hasVotedInLast12Hours, "User has not voted in the last 12 hours.");

		await db.vote.update({
			where: {
				id: hasVotedInLast12Hours.id
			},
			data: {
				reward_collected: true
			}
		});

		return json({
			success: true,
			message: `Collected reward for ${nick}.`
		});
	} catch (e) {
		return json({
			success: false,
			message: "message" in (e as any) ? (e as Error).message : "An error occurred."
		});
	}
}
