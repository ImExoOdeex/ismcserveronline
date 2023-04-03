import { authenticator } from "../../auth/auth.server";
import { db } from "../db.server";

export async function isUserAuthInDB(request: Request) {
	const auth = await authenticator.isAuthenticated(request);

	if (!auth) {
		return false;
	}

	const isInDB: boolean = (await db.user.findUnique({
		where: {
			email: auth.email
		},
		select: {
			id: true
		}
	}))
		? true
		: false;

	return isInDB;
}
