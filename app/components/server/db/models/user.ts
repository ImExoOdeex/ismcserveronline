import { authenticator } from "../../auth/authenticator.server";
import { db } from "../db.server";

export async function getUserId(request: Request) {
	const auth = await authenticator.isAuthenticated(request);

	if (!auth) {
		return null;
	}

	return auth.id;
}

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
