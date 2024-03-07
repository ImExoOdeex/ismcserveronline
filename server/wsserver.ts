import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

export async function startWsServer() {
	const server = new Server();
	const wss = new WebSocketServer({ server });
	const rooms: Map<string, Set<WebSocket>> = new Map();

	wss.on("connection", (ws) => {
		let currentRoomId: string | null = null;

		ws.on("message", (message) => {
			const parsedMessage = JSON.parse(message.toString());

			if (parsedMessage.type === "init") {
				// check if the room exists
				const roomId = parsedMessage.roomId;
				if (!rooms.has(roomId)) {
					rooms.set(roomId, new Set());
				}
				rooms.get(roomId)?.add(ws);
				currentRoomId = roomId;
			} else if (parsedMessage.type === "message") {
				// broadcast the message to all clients in the room
				const roomId = currentRoomId;
				if (roomId && rooms.has(roomId)) {
					rooms.get(roomId)?.forEach((client) => {
						if (client !== ws) {
							client.send(JSON.stringify({ type: "message", data: parsedMessage.data }));
						}
					});
				}
			}
		});

		ws.on("close", () => {
			if (currentRoomId && rooms.has(currentRoomId)) {
				rooms.get(currentRoomId)?.delete(ws);
			}
		});
	});

	server.listen(Number(3005));
	console.log("WebSocket server started on port 3005");
}

function generateRoomId() {
	// Generate a random room ID (you can implement your own logic here)
	return Math.random().toString(36).substring(7);
}
