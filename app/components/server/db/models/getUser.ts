import { authenticator } from "../../auth/authenticator.server";
import { db } from "../db.server";

export async function getUser(request: Request) {
	const auth = await authenticator.isAuthenticated(request);

	if (!auth) {
		return null;
	}

	const user = await db.user.findUnique({
		where: {
			email: auth.email
		},
		select: {
			id: true,
			email: true,
			snowflake: true,
			nick: true,
			photo: true,
			bio: true
		}
	});

	return user;
}
