import { Logger } from "@/.server/modules/Logger";
import type { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { Server } from "node:http";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

interface Message<T extends "server" | "client"> {
    from: T;
    intent: T extends "server" ? "Authorize" | "Data" | "ConsoleMessage" : "Authorize" | "Command";
    data: T extends "server"
        ? { token?: string | null; usage?: any; consoleMessage?: string }
        : { token?: string | null; command?: string };
}

export interface Usage {
    cpu: number;
    players: number;
    maxPlayers: number;
    tps: number;
    memory: number;
    memoryMax: number;
    uptime: number;
}

export interface OutgoingMessage<T extends "server" | "client"> {
    intent: T extends "server" ? "Start" | "Stop" | "Command" : "Data" | "ConsoleMessage";
    data?: T extends "server"
        ? { command: string } | undefined
        : { usage?: Usage; consoleMessage?: string };
}

interface Client {
    id: string;
    type: "server" | "client";
    ws: WebSocket;
}

export class WsServer extends WebSocketServer {
    private rooms = new Map<number, Client[]>();

    constructor(db: PrismaClient) {
        const server = new Server();
        super({ server });

        this.on("connection", (ws) => {
            let id: string | null = null;
            let type: "server" | "client" | null = null;
            let currentRoomId: number | null = null;
            console.log("WebSocket client connected");

            const disconnectTimeout = setTimeout(() => {
                closeWithReason(
                    "No Authorization message received in 5 seconds. Closing connection."
                );
            }, 5000);

            function closeWithReason(reason: string, code = 4000) {
                ws.close(code, reason);
            }

            ws.on("message", async (strMessage) => {
                const parsedMessage = JSON.parse(strMessage.toString());

                if (parsedMessage.from === "server") {
                    const message = parsedMessage as Message<"server">;
                    // console.log("Message from server:", message);

                    if (message.intent === "Authorize") {
                        type = "server";
                        const token = message.data.token;
                        if (!token) return closeWithReason("No token provided", 4001);

                        // add client to room with that server
                        const serverToken = await db.serverToken.findUnique({
                            where: { token }
                        });
                        if (!serverToken) return closeWithReason("Invalid token", 4001);
                        const server = await db.server.findUnique({
                            where: { id: serverToken.server_id }
                        });
                        if (!server) return closeWithReason("Server not found");
                        console.log("Authorized with token:", message.data.token);

                        clearTimeout(disconnectTimeout);

                        const roomId = server.id;
                        id = generateId();

                        if (!this.rooms.has(roomId)) {
                            this.rooms.set(roomId, [{ id, type: "server", ws }]);
                            currentRoomId = roomId;
                        } else {
                            const room = this.rooms.get(roomId);

                            if (room?.some((c) => c.type === "server")) {
                                console.error("Server already connected to this room", this.rooms);
                                console.log("disconnecting old server");
                                const oldServer = room.find((c) => c.type === "server");
                                oldServer!.ws.close();
                                // return closeWithReason("Server already connected to this room");
                            }

                            if (room?.some((c) => c.type === "client")) {
                                ws.send(
                                    JSON.stringify({
                                        intent: "Start"
                                    } as OutgoingMessage<"server">)
                                );
                            }

                            room?.push({ id, type: "server", ws });
                            currentRoomId = roomId;
                        }

                        console.log("Added client to room", this.rooms);
                    } else if (message.intent === "Data") {
                        // console.log("Data from client:", message.data.usage);
                        const usage = message.data.usage;
                        if (!usage) return;

                        // send data to all clients in the room
                        const room = currentRoomId ? this.rooms.get(currentRoomId) : null;
                        if (!room) return;

                        for (const { type, ws: client } of room) {
                            if (type === "server") continue;
                            client.send(
                                JSON.stringify({
                                    intent: "Data",
                                    data: { usage }
                                } as OutgoingMessage<"client">)
                            );
                        }
                    } else if (message.intent === "ConsoleMessage") {
                        const data = message.data;
                        if (!data) return;

                        // send data to all clients in the room
                        const room = currentRoomId ? this.rooms.get(currentRoomId) : null;
                        if (!room) return;

                        for (const { type, ws: client } of room) {
                            if (type === "server") continue;
                            client.send(
                                JSON.stringify({
                                    intent: "ConsoleMessage",
                                    data: {
                                        consoleMessage: data.consoleMessage
                                    }
                                } as OutgoingMessage<"client">)
                            );
                        }
                    }
                } else if (parsedMessage.from === "client") {
                    const message = parsedMessage as Message<"client">;

                    if (message.intent === "Authorize") {
                        type = "client";
                        console.log("Authorizing client with token:", message.data.token);
                        const token = message.data.token;
                        if (!token) return closeWithReason("No token provided");

                        // add client to room with that server
                        const serverToken = await db.serverToken.findUnique({
                            where: { token }
                        });
                        if (!serverToken) return closeWithReason("Invalid token");
                        const server = await db.server.findUnique({
                            where: { id: serverToken.server_id }
                        });
                        if (!server) return closeWithReason("Server not found");

                        clearTimeout(disconnectTimeout);

                        id = generateId();

                        const roomId = server.id;
                        if (!this.rooms.has(roomId)) {
                            this.rooms.set(roomId, [{ id, type: "client", ws }]);
                            currentRoomId = roomId;
                        } else {
                            this.rooms.get(roomId)?.push({ id, type: "client", ws });
                            currentRoomId = roomId;

                            const serverClient = this.rooms
                                .get(roomId)
                                ?.find((c) => c.type === "server");

                            if (serverClient) {
                                serverClient.ws.send(
                                    JSON.stringify({
                                        intent: "Start"
                                    } as OutgoingMessage<"server">)
                                );
                            }
                        }

                        console.log("Added client to room", this.rooms);
                    } else if (message.intent === "Command") {
                        const command = message.data.command;
                        if (!command) return;

                        const room = currentRoomId ? this.rooms.get(currentRoomId) : null;
                        if (!room) return;

                        const serverClient = room.find((c) => c.type === "server");

                        if (serverClient) {
                            serverClient.ws.send(
                                JSON.stringify({
                                    intent: "Command",
                                    data: { command }
                                } as OutgoingMessage<"server">)
                            );
                        }
                    }
                }
            });

            ws.on("close", () => {
                if (!currentRoomId || !type) return;

                const clients = this.rooms.get(currentRoomId);
                if (!clients) {
                    console.error("No room found", currentRoomId);
                    return;
                }
                const deleted = clients.splice(
                    clients.findIndex((c) => c.id === id),
                    1
                );
                console.log("deleted", deleted);
                console.log("Removed client from room", this.rooms);

                // if there are no more clients in the room and there is a server, send stop message. if there are no more clients in the room, delete the room
                if (clients.length === 0) {
                    this.rooms.delete(currentRoomId);
                } else if (type === "client") {
                    const isSomeClient = clients.some((c) => c.type === "client");
                    if (!isSomeClient) {
                        const serverClient = clients.find((c) => c.type === "server");

                        if (serverClient) {
                            serverClient.ws.send(
                                JSON.stringify({
                                    intent: "Stop"
                                } as OutgoingMessage<"server">)
                            );
                        }
                    }
                }
                console.log("WebSocket client disconnected");
            });
        });

        server?.listen(Number(process.env.WS_PORT) || 3005);
        Logger(
            `WebSocket server running on ws://localhost:${process.env.WS_PORT || 3005}`,
            "green",
            "black",
            true
        );
    }

    public getRooms() {
        return this.rooms;
    }
}

function generateId() {
    return Math.random().toString(36).substring(7);
}
