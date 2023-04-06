import type { AppLoadContext } from "@remix-run/node";
import { isSession, redirect, type Session, type SessionStorage } from "@remix-run/server-runtime";
import { discordStrategy } from "./discordStrategy";

export interface AuthenticateCallback<User> {
	(user: User): Promise<Response>;
}

export interface AuthenticatorOptions {
	sessionKey?: AuthenticateOptions["sessionKey"];
	sessionErrorKey?: AuthenticateOptions["sessionErrorKey"];
	sessionStrategyKey?: AuthenticateOptions["sessionStrategyKey"];
	throwOnError?: AuthenticateOptions["throwOnError"];
}

interface AuthenticateOptions {
	sessionKey: string;
	sessionErrorKey: string;
	sessionStrategyKey: string;
	name: string;
	successRedirect?: string;
	failureRedirect?: string;
	throwOnError?: boolean;
	context?: AppLoadContext;
}

export class Authenticator<User = unknown> {
	public readonly sessionKey: NonNullable<AuthenticatorOptions["sessionKey"]>;
	public readonly sessionErrorKey: NonNullable<AuthenticatorOptions["sessionErrorKey"]>;
	public readonly sessionStrategyKey: NonNullable<AuthenticateOptions["sessionStrategyKey"]>;
	private readonly throwOnError: AuthenticatorOptions["throwOnError"];

	constructor(private sessionStorage: SessionStorage, options: AuthenticatorOptions = {}) {
		this.sessionKey = options.sessionKey || "user";
		this.sessionErrorKey = options.sessionErrorKey || "auth:error";
		this.sessionStrategyKey = options.sessionStrategyKey || "strategy";
		this.throwOnError = options.throwOnError ?? false;
	}

	// Authenticate the user
	async authenticate(
		request: Request,
		options: Pick<AuthenticateOptions, "successRedirect" | "failureRedirect" | "throwOnError" | "context"> = {}
	): Promise<User> {
		return discordStrategy.authenticate(new Request(request.url, request), this.sessionStorage, {
			throwOnError: this.throwOnError,
			...options,
			name: "discord",
			sessionKey: this.sessionKey,
			sessionErrorKey: this.sessionErrorKey,
			sessionStrategyKey: this.sessionStrategyKey
		});
	}

	// Check if the user is authenticated. If yes returns User object, else returs null
	async isAuthenticated(
		request: Request | Session,
		options:
			| { successRedirect?: never; failureRedirect?: never }
			| { successRedirect: string; failureRedirect?: never }
			| { successRedirect?: never; failureRedirect: string }
			| { successRedirect: string; failureRedirect: string } = {}
	): Promise<User | null> {
		const session = isSession(request) ? request : await this.sessionStorage.getSession(request.headers.get("Cookie"));

		const user: User | null = session.get(this.sessionKey) ?? null;

		if (user) {
			if (options.successRedirect) throw redirect(options.successRedirect);
			else return user;
		}

		if (options.failureRedirect) throw redirect(options.failureRedirect);
		else return null;
	}

	// Logout from current session
	async logout(request: Request | Session, options: { redirectTo: string }): Promise<never> {
		const session = isSession(request) ? request : await this.sessionStorage.getSession(request.headers.get("Cookie"));

		throw redirect(options.redirectTo, {
			headers: {
				"Set-Cookie": await this.sessionStorage.destroySession(session)
			}
		});
	}
}
