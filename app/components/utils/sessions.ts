import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage({
        cookie: {
            name: "__session",
            secrets: ["r3m1xr0ck5"],
            sameSite: "lax",
        },
    });

export { getSession, commitSession, destroySession };