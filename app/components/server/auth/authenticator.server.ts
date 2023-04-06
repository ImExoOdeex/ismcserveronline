import { sessionStorage } from "../session.server";
import { Authenticator } from "./authenticatorClass";

type DiscordUser = {
	email: string;
	snowflake: string;
};

export const authenticator = new Authenticator<DiscordUser>(sessionStorage, {
	throwOnError: true
});
