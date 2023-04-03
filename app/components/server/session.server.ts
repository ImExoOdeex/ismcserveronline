import { createCookieSessionStorage } from "@remix-run/node";

if (!process.env.SESSION_SECRET) throw new Error("process.env.SESSION_SECRET is wrong!");

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === "production"
	}
});

export const { getSession, commitSession, destroySession } = sessionStorage;
