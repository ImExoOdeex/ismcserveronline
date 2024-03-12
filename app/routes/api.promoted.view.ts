import { db } from "@/.server/db/db";
import { getUserId } from "@/.server/db/models/user";
import type { ActionFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";
import { typedjson } from "remix-typedjson";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import invariant from "tiny-invariant";
import { csrf } from "../src/.server/functions/security.server";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);

	try {
		const form = await request.formData();

		const id = Number(form.get("id"));
		invariant(id, "Invalid id");

		const ip = getClientIPAddress(request) || "";
		// invariant(ip, "Invalid ip");
		const userAgent = request.headers.get("User-Agent");
		invariant(userAgent, "Invalid userAgent");

		const userId = await getUserId(request);

		// filters
		{
			// dont create new view if user is the owner
			const promoted = await db.promoted.findUnique({
				where: {
					id
				},
				select: {
					Server: {
						select: {
							owner_id: true
						}
					}
				}
			});
			invariant(promoted, "Promoted not found");

			if (promoted.Server.owner_id === userId) {
				throw new Error("Owner cannot view own promoted");
			}

			// dont create the view if same ip has viewed promoted 3 times in the last 5 minutes
			const count = await db.promotedView.count({
				where: {
					promoted_id: id,
					client_ip: ip,
					created_at: {
						gte: dayjs().subtract(5, "minute").toDate()
					}
				}
			});
			if (count >= 3) {
				throw new Error("Too many views");
			}
		}

		// create the view
		const view = await db.promotedView.create({
			data: {
				promoted_id: id,
				client_ip: ip,
				user_agent: userAgent,
				user_id: userId,
				type: "Impression"
			}
		});

		return typedjson({
			success: true,
			view
		});
	} catch (e) {
		console.error((e as Error)?.message);
		return typedjson({
			success: false,
			message: (e as Error).message
		});
	}
}
