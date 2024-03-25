import { useCallback, useEffect, useState } from "react";

interface Options {
	onMessage?: (message: MessageEvent<any>, ws: WebSocket) => void;
	onOpen?: (event: Event, ws: WebSocket) => void;
	onClose?: (event: CloseEvent, ws?: WebSocket | null) => void;
	onError?: (event: Event, ws: WebSocket) => void;
}

export default function useWebSocket(url: string, { onMessage, onOpen, onClose, onError }: Options) {
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	const createWebSocket = useCallback(() => {
		const websocket = new WebSocket(url);

		websocket.onopen = (e) => {
			setIsConnected(true);
			onOpen && onOpen(e, websocket);
		};

		websocket.onclose = (e) => {
			setIsConnected(false);
			onClose && onClose(e, ws);
		};

		websocket.onmessage = (message: MessageEvent<any>) => {
			onMessage && onMessage(message, websocket);
		};

		websocket.onerror = (error) => {
			console.warn("WebSocket error", error);
			onError && onError(error, websocket);
		};

		return websocket;
	}, [url, onMessage, onOpen, onClose, onError, ws]);

	useEffect(() => {
		const websocket = createWebSocket();
		setWs(websocket);

		return () => {
			websocket.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	const sendMessage = useCallback(
		(message: Record<string, any>) => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(message));
			} else {
				console.error("No WebSocket connection", ws?.readyState);
			}
		},
		[ws]
	);

	const reconnect = useCallback(() => {
		if (ws) {
			ws.close();
		}
		setWs(createWebSocket());
	}, [ws]);

	return { ws, isConnected, sendMessage, reconnect };
}
