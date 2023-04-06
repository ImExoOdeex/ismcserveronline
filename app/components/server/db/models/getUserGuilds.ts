import { authenticator } from "../../auth/authenticator.server";
import { db } from "../db.server";

export async function getUserGuilds(request: Request) {
	const auth = await authenticator.isAuthenticated(request);

	if (!auth) {
		return null;
	}

	const user = await db.user.findUnique({
		where: {
			email: auth.email
		},
		select: {
			guilds: true
		}
	});

	return user?.guilds;
}
