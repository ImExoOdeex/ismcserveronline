import { createCookieSessionStorage } from "@remix-run/node";
import { requireEnv } from "./functions/env.server";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secrets: [requireEnv("SESSION_SECRET")],
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 365 // 1 year
	}
});

export const { getSession, commitSession, destroySession } = sessionStorage;
