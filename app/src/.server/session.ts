import { createCookieSessionStorage } from "@remix-run/node";
import { requireEnv } from "./functions/env.server";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secrets: [requireEnv("SESSION_SECRET")],
		secure: process.env.NODE_ENV === "production"
	}
});

export const { getSession, commitSession, destroySession } = sessionStorage;
