import useWebSocket from "@/hooks/useWebsocket";
import RealTimeConnected from "@/layout/routes/server/panel/realtime/RealTimeConnected";
import RealTimeConnecting from "@/layout/routes/server/panel/realtime/RealTimeConnecting";

export default function RealTimeServerDataWrapper() {
	const { isConnected, sendMessage, ws } = useWebSocket("ws://localhost:3005", {
		onMessage(message, ws) {
			console.log("onMessage", message);
		}
	});

	if (isConnected) {
		return <RealTimeConnected />;
	}
	return <RealTimeConnecting />;
}
