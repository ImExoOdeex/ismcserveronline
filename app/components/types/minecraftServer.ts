export type MinecraftServer = {
	online: boolean;
	host: string;
	ip: string | null;
	port: number | null;
	version: {
		array: Array<string> | null | undefined;
		string: string | null | undefined;
	} | null;
	protocol: number | null;
	software: string | null;
	plugins: string[];
	map: string | null;
	motd: {
		raw: string | null;
		clean: string | null;
		html: string | null;
	};
	favicon: string | null;
	players: {
		online: number;
		max: number;
		list: { name: string; id: string | null }[];
	};
	ping: number | null;
	debug: {
		status: boolean;
		query: boolean;
		legacy: boolean;
	};
};

export type MinecraftServerWoQuery = {
	online: boolean;
	host: string;
	port: number | null;
	version: {
		array: Array<string> | null | undefined;
		string: string | null | undefined;
	} | null;
	protocol: number | null | undefined;
	software: string | null;
	motd: {
		raw: string | null;
		clean: string | null;
		html: string | null;
	};
	favicon: string | null;
	players: {
		online: number;
		max: number;
		list: { name: string; id: string }[] | null | undefined;
	};
	ping: number | null;
	debug: {
		status: boolean;
		query: boolean;
		legacy: boolean;
	};
};

export type JavaServer = MinecraftServer | MinecraftServerWoQuery;
export type AnyServer = JavaServer | BedrockServer;

export type BedrockServer = {
	online: boolean;
	host: string;
	port: {
		ipv4: number | null;
		ipv6: number | null;
		srv: number | null;
	};
	edition: string | null;
	version: string | null;
	protocol: number | null;
	guid: string | null;
	id: string | null;
	gamemode: {
		id: number | null;
		name: string | null;
	};
	motd: {
		raw: string | null;
		clean: string | null;
		html: string | null;
	};
	players: {
		online: number;
		max: number;
	};
};

// server model in db types
export namespace ServerModel {
	// T is bedrock (true) or java (false)
	// K is query (true) or no query (false)
	export interface Players<T extends boolean> {
		online: number;
		max: number;
		list: T extends false ? { name: string; id: string | null }[] : never;
	}

	export interface Motd {
		raw: string | null;
		clean: string | null;
		html: string | null;
	}

	export type Version<T extends boolean> = T extends false
		? {
				array: Array<string> | null | undefined;
				string: string | null | undefined;
		  }
		: string | null;

	export type Gamemonde<T extends boolean> = T extends true
		? {
				id: number | null;
				name: string | null;
		  }
		: never;

	export type Ip<K extends boolean> = K extends true ? string | null : never;
	export type Plugins<K extends boolean> = K extends true ? string[] : never;
	export type Map<K extends boolean> = K extends true ? string | null : never;
}
