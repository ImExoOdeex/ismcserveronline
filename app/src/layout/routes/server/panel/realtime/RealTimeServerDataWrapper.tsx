import type { OutgoingMessage, Usage } from "@/../../server/wsserver";
import useWebSocket from "@/hooks/useWebsocket";
import RealTimeConnected from "@/layout/routes/server/panel/realtime/RealTimeConnected";
import RealTimeConnecting from "@/layout/routes/server/panel/realtime/RealTimeConnecting";
import RealTimeError from "@/layout/routes/server/panel/realtime/RealTimeError";
import RealTimeWaiting from "@/layout/routes/server/panel/realtime/RealTimeWaiting";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function RealTimeServerDataWrapper({
    token,
    url
}: { url: string; token: string | null }) {
    const [data, setData] = useState<Usage | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { isConnected, reconnect } = useWebSocket(url, {
        onMessage(message, _ws) {
            const data = JSON.parse(message.data) as OutgoingMessage<"client">;

            const usage = data.intent === "Data" ? (data.data?.usage as Usage) : null;
            setData(usage);
        },
        onOpen(_e, ws) {
            console.log("authorizing with server token");

            ws.send(
                JSON.stringify({
                    from: "client",
                    intent: "Authorize",
                    data: { token }
                })
            );
        },
        onClose(e, _ws) {
            setError(e.reason || "Connection closed");
        },
        onError(e, _ws) {
            console.log("onError");
            setError(e instanceof Error ? e.message : "Unknown error");
        }
    });

    return (
        <Flex flexDir={"column"} gap={4}>
            <Flex flexDir={"column"} gap={2}>
                <Heading size={"md"}>Real time server stats</Heading>
                <Text color={"textSec"}>
                    Install plugin and view real-time data of your server.
                </Text>
            </Flex>

            {(() => {
                if (error) {
                    return (
                        <RealTimeError
                            error={error}
                            reconnect={() => {
                                reconnect();
                                setError(null);
                            }}
                        />
                    );
                }
                if (isConnected) {
                    if (!data) {
                        return <RealTimeWaiting />;
                    }
                    return <RealTimeConnected data={data} />;
                }
                return <RealTimeConnecting />;
            })()}
        </Flex>
    );
}
