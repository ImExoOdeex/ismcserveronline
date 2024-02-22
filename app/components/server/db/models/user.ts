import { Prisma } from "@prisma/client";
import { redirect } from "remix-typedjson";
import { authenticator } from "../../auth/authenticator.server";
import { db } from "../db.server";

export async function getUserId(request: Request) {
	const auth = await authenticator.isAuthenticated(request);

	if (!auth) {
		return null;
	}

	return auth.id;
}

export async function getUser<T extends Prisma.UserSelect>(
	request: Request,
	select: T = {
		id: true,
		email: true,
		snowflake: true,
		nick: true,
		photo: true,
		everPurchased: true,
		role: true,
		prime: true,
		subId: true
	} as T
): Promise<Prisma.UserGetPayload<{
	select: T;
}> | null> {
	const auth = await authenticator.isAuthenticated(request);

	if (!auth) {
		return null;
	}
	if (!auth.id || !auth.email) {
		throw redirect("/relog");
	}

	const user = await db.user.findUnique({
		where: {
			email: auth.email
		},
		select
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
