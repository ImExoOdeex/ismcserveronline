import { sessionStorage } from "../session.server";
import { Authenticator } from "./authenticatorClass";

interface DiscordUser {
	email: string;
	snowflake: string;
	id: number;
}

export const authenticator = new Authenticator<DiscordUser>(sessionStorage, {
	throwOnError: true
});
