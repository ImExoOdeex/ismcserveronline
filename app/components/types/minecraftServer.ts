export type MinecraftServer = {
    online: boolean;
    host: string;
    ip: string | null;
    port: number | null;
    version: {
        array: Array<string> | null | undefined,
        string: string | null | undefined
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

// 
// differences:
// 
// + ip
// - plugins
//  
//

export type MinecraftServerWoQuery = {
    online: boolean;
    host: string;
    port: number | null;
    version: {
        array: Array<string> | null | undefined,
        string: string | null | undefined
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