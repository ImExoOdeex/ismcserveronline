import { PaymentStatus, Role, SOURCE } from "@prisma/client";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import * as fs from "node:fs/promises";
import { db } from "~/components/server/db/db.server";
import { Guild } from "./dashboard.bot._index";

// enum Role {
// 	ADMIN
// 	USER
//   }

//   // do not the fuck ask why this is via email, not id ok?
//   model User {
// 	id            Int            @id @unique @default(autoincrement())
// 	email         String         @unique
// 	snowflake     String         @unique
// 	nick          String
// 	photo         String?
// 	everPurchased Boolean        @default(false)
// 	prime         Boolean        @default(false)
// 	subId         String?
// 	role          Role           @default(USER)
// 	guilds        Json?
// 	created_at    DateTime       @default(now())
// 	updated_at    DateTime       @updatedAt
// 	Comment       Comment[]
// 	SavedServer   SavedServer[]
// 	SampleServer  SampleServer[]
// 	Token         Token?

// 	@@index([email])
//   }

//   model SavedServer {
// 	id      Int     @id @unique @default(autoincrement())
// 	server  String
// 	icon    String?
// 	online  Boolean @default(true)
// 	players Int     @default(0)
// 	bedrock Boolean @default(false)

// 	user_id Int
// 	User    User @relation(fields: [user_id], references: [id])

// 	created_at DateTime @default(now())
//   }

//   enum SOURCE {
// 	WEB
// 	DISCORD
// 	API
//   }

//   // comments are not related to any of server of check, cuz there is no server creating when someone checks it. it's determinated via address and port
//   model Comment {
// 	id         Int      @id @unique @default(autoincrement())
// 	user_id    Int
// 	user       User     @relation(fields: [user_id], references: [id])
// 	server     String
// 	bedrock    Boolean  @default(false)
// 	content    String
// 	created_at DateTime @default(now())
// 	updated_at DateTime @default(now())
//   }

//   model SampleServer {
// 	id      Int     @id @unique @default(autoincrement())
// 	server  String
// 	bedrock Boolean @default(false)
// 	favicon String

// 	user    User? @relation(fields: [user_id], references: [id])
// 	user_id Int?

// 	payment_id     String?
// 	payment_status PaymentStatus @default(PROCESSING)

// 	add_date DateTime  @default(now())
// 	end_date DateTime?
//   }

//   enum PaymentStatus {
// 	FAILED
// 	CANCELLED
// 	PROCESSING
// 	PAID
//   }

//   // this server is for popular servers
//   model Server {
// 	id         Int      @id @unique @default(autoincrement())
// 	server     String
// 	icon       String?
// 	tags       Json?
// 	created_at DateTime @default(now())
//   }

//   model Check {
// 	id         Int      @id @unique @default(autoincrement())
// 	server     String
// 	online     Boolean
// 	players    Int
// 	bedrock    Boolean  @default(false)
// 	source     SOURCE   @default(API)
// 	client_ip  String?
// 	checked_at DateTime @default(now())
// 	Token      Token?   @relation(fields: [token_id], references: [id])
// 	token_id   Int

// 	@@index([server])
//   }

//   model Token {
// 	id         Int      @id @unique @default(autoincrement())
// 	token      String   @unique
// 	user       User?    @relation(fields: [user_id], references: [id])
// 	user_id    Int?     @unique
// 	check      Check[]
// 	client_ip  String?
// 	created_at DateTime @default(now())
// 	updated_at DateTime @updatedAt
//   }

export async function action({ request }: ActionFunctionArgs) {
	// const [servers, checks] = await Promise.all([
	// 	db.server.findMany({
	// 		select: {
	// 			server: true
	// 		}
	// 	}),
	// 	db.check.findMany({
	// 		select: {
	// 			server: true,
	// 			online: true
	// 		}
	// 	})
	// ]);

	// delete duplicate servers
	// const filteredServers = servers.filter((server) => {
	// 	const duplicate = seen.has(server.server);
	// 	seen.add(server.server);
	// 	return !duplicate;
	// });

	// remove long urls from filtered
	// const longUrls = new Set<{ server: string }>();
	// for (const check of filtered) {
	// 	if (check.server.length > 50) {
	// 		longUrls.add(check);
	// 	}
	// }
	// for (const longUrl of longUrls) {
	// 	filtered.delete(longUrl);
	// }
	// await db.comment.deleteMany();
	// await db.sampleServer.deleteMany();
	// await db.savedServer.deleteMany();
	// await db.check.deleteMany();
	// await db.server.deleteMany();
	// await db.token.deleteMany();
	// await db.user.deleteMany();

	const allDB = await loadDatabaseFile();

	const seen = new Set();
	// const allDB = await saveDatabase();

	const filteredChecks = allDB.check.filter((check) => {
		const duplicate = seen.has(check.server);
		seen.add(check.server);

		// filter only addresses that are not ips, but valid domains
		const isValidAddress = check.server.match(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/);

		return !duplicate && isValidAddress && check.online;
	});

	// user yh, savedServer yh, sampleServer yh, comment yh, check yh, token

	for (const user of allDB.user) {
		await db.user.create({
			data: {
				id: user.id,
				email: user.email,
				snowflake: user.snowflake,
				nick: user.nick,
				photo: user.photo,
				everPurchased: user.everPurchased,
				prime: user.prime,
				subId: user.subId,
				role: user.role,
				guilds: user.guilds,
				created_at: user.created_at,
				updated_at: user.updated_at
			}
		});
	}

	for (const token of allDB.token) {
		await db.token.create({
			data: {
				id: token.id,
				token: token.token,
				user_id: token.user_id,
				client_ip: token.client_ip,
				created_at: token.created_at,
				updated_at: token.updated_at
			}
		});
	}

	for (const check of filteredChecks) {
		console.log(filteredChecks.indexOf(check));
		await db.server.create({
			data: {
				id: filteredChecks.indexOf(check),
				server: check.server,
				online: check.online,
				players: check.players,
				bedrock: check.bedrock,
				Check: {
					createMany: {
						data: allDB.check
							.filter((c) => c.server === check.server)
							.map((check) => {
								return {
									token_id: check.token_id,
									checked_at: check.checked_at,
									client_ip: check.client_ip,
									online: check.online,
									players: check.players,
									source: check.source
								};
							})
					}
				},
				Comment: {
					createMany: {
						data: allDB.comment
							.filter((c) => c.server === check.server)

							.map((comment) => {
								return {
									user_id: comment.user_id,
									content: comment.content,
									created_at: comment.created_at,
									updated_at: comment.updated_at
								};
							})
					}
				},
				SampleServer: {
					createMany: {
						data: allDB.sampleServer
							.filter((c) => c.server === check.server)
							.map((sampleServer) => {
								return {
									user_id: sampleServer.user_id,
									payment_id: sampleServer.payment_id,
									payment_status: sampleServer.payment_status,
									add_date: sampleServer.add_date,
									end_date: sampleServer.end_date
								};
							})
					}
				},
				SavedServer: {
					createMany: {
						data: allDB.savedServer
							.filter((c) => c.server === check.server)
							.map((savedServer) => {
								return {
									user_id: savedServer.user_id,
									created_at: savedServer.created_at
								};
							})
					}
				}
			}
		});
	}

	return json({});
}

async function saveDatabase() {
	// write a script that will migrate the database to the new schema. new schema will have new Model named Server and it will be related to other models like Check, Comment, SavedServer etc
	// the script will be run once and will be deleted after running

	// get the whole database in json format
	const [user, savedServer, sampleServer, comment, check, token] = await Promise.all([
		db.user.findMany(),
		db.savedServer.findMany(),
		db.sampleServer.findMany(),
		db.comment.findMany(),
		db.check.findMany(),
		db.token.findMany()
	]);

	const wholeDatabase = {
		user,
		savedServer,
		sampleServer,
		comment,
		check,
		token
	};

	const now = new Date().toLocaleString().replaceAll("/", "-").replaceAll(":", "-").replaceAll(" ", "-").replaceAll(",", "");
	await fs.writeFile(`migration/migration-${now}.json`, JSON.stringify(wholeDatabase, null, 2)).then(() => {
		console.log("migration.json has been created");
	});

	return wholeDatabase;
}

async function loadDatabaseFile() {
	const file = await fs.readFile(`migration/migration-2-10-2024-7-04-58-PM.json`, "utf-8");
	const json = JSON.parse(file) as {
		user: {
			id: number;
			email: string;
			snowflake: string;
			nick: string;
			photo: string;
			everPurchased: boolean;
			prime: boolean;
			subId: string;
			role: Role;
			guilds: Guild[];
			created_at: Date;
			updated_at: Date;
		}[];
		savedServer: {
			id: number;
			server: string;
			icon: string;
			online: boolean;
			players: number;
			bedrock: boolean;
			user_id: number;
			created_at: Date;
		}[];
		sampleServer: {
			id: number;
			server: string;
			bedrock: boolean;
			favicon: string;
			user_id: number;
			payment_id: string;
			payment_status: PaymentStatus;
			add_date: Date;
			end_date: Date;
		}[];
		comment: {
			id: number;
			user_id: number;
			server: string;
			bedrock: boolean;
			content: string;
			created_at: Date;
			updated_at: Date;
		}[];
		check: {
			id: number;
			server: string;
			online: boolean;
			players: number;
			bedrock: boolean;
			source: SOURCE;
			client_ip: string;
			checked_at: Date;
			token_id: number;
		}[];
		token: { id: number; token: string; user_id: number; client_ip: string; created_at: Date; updated_at: Date }[];
	};
	return json;
}
