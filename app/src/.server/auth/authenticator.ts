import { sessionStorage } from "@/.server/session";
import { Authenticator } from "./authenticator.class";

export interface DiscordUser {
    email: string;
    snowflake: string;
    id: number;
}

export const authenticator = new Authenticator<DiscordUser>(sessionStorage, {
    throwOnError: true
});
