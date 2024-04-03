import { db } from "../db/db";

export async function getCounts() {
	const [users, checks, comments, savedServers, verifiedServers, votes, tags] = await Promise.all([
		db.user.count(),
		db.check.count(),
		db.comment.count(),
		db.savedServer.count(),
		db.server.count({
			where: {
				owner_id: {
					not: null
				}
			}
		}),
		db.vote.count(),
		db.tag.count()
	]);

	return {
		users,
		checks,
		comments,
		savedServers,
		verifiedServers,
		votes,
		tags
	};
}

export async function getStats() {
	const [users, checks, comments, savedServers, votes, verifiedServers] = await Promise.all([
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
		}),
		db.vote.findMany({
			orderBy: {
				created_at: "desc"
			},
			include: {
				Server: true
			},
			take: 10
		}),
		db.server.findMany({
			where: {
				owner_id: {
					not: null
				}
			},
			orderBy: {
				created_at: "desc"
			},
			include: {
				Owner: true,
				Verification: true
			},
			take: 10
		})
	]);

	return {
		users,
		checks,
		comments,
		savedServers,
		votes,
		verifiedServers
	};
}
