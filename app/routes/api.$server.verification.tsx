import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { getServerInfo } from "@/.server/functions/api.server";
import { generateVerificationCode } from "@/.server/functions/verification.server";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

/* 
	$server param is a srever address with port
	?bedrock search param indicates if the server is bedrock or not. ?bedrock -> bedrock, no search param -> java
 */

// GET to check if server has been verified
export async function loader({ request, params }: LoaderFunctionArgs) {
	try {
		const user = await getUser(request);
		invariant(user, "User is not logged in");

		const url = new URL(request.url);
		const bedrock = url.searchParams.get("bedrock") === "";

		const server = await db.server.findFirst({
			where: {
				server: params.server?.toLowerCase(),
				bedrock
			},
			select: {
				owner_id: true,
				id: true,
				server: true,
				bedrock: true
			}
		});
		invariant(server, "Server not found");

		const isVerified = server.owner_id;

		return typedjson({
			success: true,
			isVerified
		});
	} catch (e) {
		return typedjson({
			success: false,
			message: (e as any).message
		});
	}
}

// POST to create a new verification session
export async function action({ request, params }: ActionFunctionArgs) {
	try {
		const form = await request.formData();
		const intent = form.get("intent")?.toString() as "start" | "check";
		invariant(intent === "start" || intent === "check", "Invalid intent");

		const user = await getUser(request, {
			id: true
		});
		invariant(user, "User is not logged in");

		const url = new URL(request.url);
		const bedrock = url.searchParams.get("bedrock") === "";
		const server = await db.server.findFirst({
			where: {
				server: params.server?.toLowerCase(),
				bedrock
			}
		});
		invariant(server, "Server not found");
		invariant(!server.owner_id, "This server has already been verified");

		// named action
		switch (intent) {
			case "start": {
				// user can't craete more than 10 verifications
				const verifications = await db.verification.count({
					where: {
						user_id: user.id
					}
				});
				invariant(verifications < 10, "You can't create more than 10 verifications");

				// create verification
				const code = generateVerificationCode();

				const verification = await db.verification.create({
					data: {
						user_id: user.id,
						server_id: server.id,
						code
					}
				});

				return typedjson({
					success: true,
					code,
					verification
				});
			}
			case "check": {
				const verification = await db.verification.findFirst({
					where: {
						user_id: user.id,
						server_id: server.id
					},
					orderBy: {
						created_at: "desc"
					}
				});
				invariant(verification, "You have not created a verification for this server");

				const data = await getServerInfo(server.server, false, server.bedrock);
				invariant(data, "Failed to get server info");
				invariant(data.motd.raw, "Server MOTD not found");

				if (!data.motd.raw.includes(verification.code)) {
					throw new Error("Verification code not found in server MOTD");
				}

				await Promise.all([
					db.server.update({
						where: {
							id: server.id
						},
						data: {
							owner_id: user.id
						}
					}),
					db.verification.update({
						where: {
							id: verification.id
						},
						data: {
							success: true,
							verified_at: new Date()
						}
					})
				]);

				return redirect(`/${bedrock ? "bedrock/" : ""}${server.server}/panel`);
			}
			default: {
				throw new Error("Invalid intent");
			}
		}
	} catch (e) {
		return typedjson({
			success: false,
			message: (e as any).message
		});
	}
}
