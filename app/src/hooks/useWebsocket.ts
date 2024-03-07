import { useCallback, useEffect, useState } from "react";

interface Options {
	onMessage?: (message: MessageEvent<any>, ws: WebSocket) => void;
	onOpen?: (event: Event, ws: WebSocket) => void;
	onClose?: (event: CloseEvent, ws?: WebSocket | null) => void;
}

export default function useWebSocket(url: string, { onMessage, onOpen, onClose }: Options) {
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const websocket = new WebSocket(url);

		websocket.onopen = (e) => {
			console.log("///////////// opened");
			setIsConnected(true);
			onOpen && onOpen(e, websocket);
		};

		websocket.onclose = (e) => {
			console.log("///////////// closed", e.reason);
			setIsConnected(false);
			onClose && onClose(e, ws);
		};

		websocket.onmessage = (message: MessageEvent<any>) => {
			onMessage && onMessage(message, websocket);
		};

		websocket.onerror = (error) => {
			console.warn("WebSocket error", error);
		};

		setWs(websocket);

		return () => {
			websocket.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	const sendMessage = useCallback(
		(message: Record<string, any>) => {
			console.log("sendMessage state", ws?.readyState);
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(message));
			} else {
				console.error("No WebSocket connection", ws?.readyState);
			}
		},
		[ws]
	);

	return { ws, isConnected, sendMessage };
}
