import { db } from "../db/db.server";

export async function getCounts() {
	const [users, checks, comments, savedServers] = await Promise.all([
		db.user.count(),
		db.check.count(),
		db.comment.count(),
		db.savedServer.count()
	]);

	return {
		users,
		checks,
		comments,
		savedServers
	};
}

export async function getStats() {
	const [users, checks, comments, savedServers] = await Promise.all([
		db.user.findMany({
			orderBy: {
				created_at: "desc"
			},
			take: 10
		}),
		db.check.findMany({
			orderBy: {
				checked_at: "desc"
			},
			include: {
				Server: true
			},
			take: 10
		}),
		db.comment.findMany({
			orderBy: {
				created_at: "desc"
			},
			include: {
				Server: true
			},
			take: 10
		}),
		db.savedServer.findMany({
			orderBy: {
				created_at: "desc"
			},
			include: {
				Server: true
			},
			take: 10
		})
	]);

	return {
		users,
		checks,
		comments,
		savedServers
	};
}
