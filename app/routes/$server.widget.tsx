import { getServerInfo } from "@/.server/functions/api.server";
import config from "@/utils/config";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { renderAsync } from "@resvg/resvg-js";
import fs from "node:fs/promises";
import satori from "satori";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const bedrock = url.pathname.split("/")[1] === "bedrock";

    const server = params.server as string;
    const data = await getServerInfo(server, false, bedrock);

    const dark = url.searchParams.has("dark") && url.searchParams.get("dark") !== "false";
    const rounded = url.searchParams.has("rounded") && url.searchParams.get("rounded") !== "false";
    const roundedValue = url.searchParams.get("rounded") || 24;

    const statusColor = data.online ? (dark ? "#3ad386" : "#30b371") : "#f44336";

    const template = (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                fontFamily: "Montserrat",
                backgroundColor: "transparent"
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    backgroundColor: dark ? "#121212" : "#f9f9f9",
                    borderRadius: rounded ? roundedValue : 0,
                    color: dark ? "#f9f9f9" : "#121212",
                    padding: 48,
                    gap: 48,
                    alignItems: "flex-start"
                }}
            >
                {"favicon" in data && data.favicon && (
                    <img
                        src={data.favicon}
                        style={{
                            height: "100%",
                            imageRendering: "pixelated",
                            borderRadius: 24,
                            aspectRatio: "1 / 1"
                        }}
                        alt={`${server}'s favicon`}
                    />
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flex: 1
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "flex-start"
                        }}
                    >
                        {/* status */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 24,
                                alignItems: "center",
                                color: statusColor,
                                fontFamily: "MontserratSemibold"
                            }}
                        >
                            <div
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: "50%",
                                    backgroundColor: statusColor
                                }}
                            />
                            <h1 style={{ fontSize: 92, margin: 0 }}>
                                {data.online ? "Online" : "Offline"}
                            </h1>
                        </div>

                        {/* server name */}
                        <div
                            style={{
                                display: "flex",
                                marginTop: 12
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: 72,
                                    fontFamily: "MontserratSemibol",
                                    opacity: 0.8,
                                    margin: 0
                                }}
                            >
                                {server}
                            </h2>
                        </div>

                        {/* players */}
                        <div
                            style={{
                                display: "flex",
                                marginTop: 12
                            }}
                        >
                            <h2 style={{ fontSize: 48, opacity: 0.6, margin: 0 }}>
                                {data.players.online}/{data.players.max} players are playing right
                                now!
                            </h2>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                fontFamily: "MontserratSemibold",
                                fontSize: 48,
                                gap: 12
                            }}
                        >
                            <p>ismcserver.online</p>
                            <img
                                src={`${config.dashUrl}/favicon.png`}
                                alt="ismcserver.online logo"
                                height={54}
                                width={54}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const aspectRatio = 4 / 1;
    const width = 1920;
    const height = width / aspectRatio;

    const svg = await satori(template, {
        width,
        height,
        debug: false,
        fonts: [
            {
                name: "Montserrat",
                data: await fs.readFile("./public/Montserrat.otf"),
                weight: 500
            },
            {
                name: "MontserratSemibold",
                data: await fs.readFile("./public/MontserratSemibold.otf"),
                weight: 600
            }
        ]
    });

    const image = await renderAsync(svg, {
        imageRendering: 1
    });

    return new Response(image.asPng(), {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, s-maxage=3600, max-age=3600"
        }
    });
}
