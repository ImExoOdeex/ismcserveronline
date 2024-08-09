import useMinecraftTextFormatting from "@/hooks/useMinecraftTextFormatting";
import { Icon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useToken
} from "@chakra-ui/react";
import Convert from "ansi-to-html";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCountUp } from "react-countup";
import type { IconType } from "react-icons";
import { BiServer, BiSolidTime } from "react-icons/bi";
import { FaMemory } from "react-icons/fa";
import { FiCpu, FiUser } from "react-icons/fi";
import { HiMiniCommandLine } from "react-icons/hi2";
import type { Usage } from "server/WsServer";
import { LineSegment, VictoryArea, VictoryAxis, VictoryChart } from "victory";

const convert = new Convert();

export default memo(function RealTimeConnected({
    data,
    consoleMessages,
    sendComamnd
}: { data: Usage; consoleMessages: string[]; sendComamnd: (command: string) => void }) {
    const memoryPercent = (data.memory / data.memoryMax) * 100;

    const duration = 2;
    const useEasing = false;

    const cpuRef = useRef(null);
    const cpuCounter = useCountUp({
        start: 0,
        ref: cpuRef,
        end: Math.round(data.cpu),
        decimals: 0,
        useEasing,
        duration
    });

    const memoryRef = useRef(null);
    const memoryCounter = useCountUp({
        start: 0,
        ref: memoryRef,
        end: data.memory,
        decimals: 0,
        useEasing,
        duration
    });

    const memoryPercentRef = useRef(null);
    const memoryPercentCounter = useCountUp({
        start: 0,
        ref: memoryPercentRef,
        end: memoryPercent,
        decimals: 0,
        useEasing,
        duration
    });

    const playersRef = useRef(null);
    const playersCounter = useCountUp({
        start: 0,
        ref: playersRef,
        end: data.players,
        decimals: 0,
        useEasing,
        duration
    });

    const tpsRef = useRef(null);
    const tpsCounter = useCountUp({
        start: 0,
        ref: tpsRef,
        decimals: 0,
        end: data.tps,
        useEasing,
        duration
    });

    const uptimeSuffix = useMemo(() => {
        if (data.uptime / 1000 / 60 / 60 / 24 > 1) {
            return "d";
        }
        if (data.uptime / 1000 / 60 / 60 > 1) {
            return "h";
        }
        if (data.uptime / 1000 / 60 > 1) {
            return "m";
        }
        return "s";
    }, [data.uptime]);

    const uptimeRef = useRef(null);
    const uptimeCounter = useCountUp({
        start: 0,
        ref: uptimeRef,
        end: 0,
        useEasing,
        duration,
        suffix: uptimeSuffix
    });

    const [cpuChartData, setCpuChartData] = useState<{ percentage: number; index: number }[]>([]);
    const [memoryChartData, setMemoryChartData] = useState<{ percentage: number; index: number }[]>(
        []
    );

    const getUptime = useCallback((uptime: number) => {
        if (uptime / 1000 / 60 / 60 / 24 > 1) {
            return Math.floor(uptime / 1000 / 60 / 60 / 24);
        }
        if (uptime / 1000 / 60 / 60 > 1) {
            return Math.floor(uptime / 1000 / 60 / 60);
        }
        if (uptime / 1000 / 60 > 1) {
            return Math.floor(uptime / 1000 / 60);
        }
        return Math.floor(uptime / 1000);
    }, []);

    useEffect(() => {
        cpuCounter.update(Math.round(data.cpu));

        // if (cpuChartData.length >= 10) {
        //     setCpuChartData((prev) =>
        //         prev.slice(-1).map((item) => ({ ...item, index: item.index }))
        //     );
        // }

        // requestAnimationFrame(() => {
        //     requestAnimationFrame(() => {
        setCpuChartData((prev) => {
            const newCpuChartData = [
                ...prev,
                {
                    percentage: data.cpu,
                    index: (prev.at(-1)?.index ?? 0) + 1
                }
            ].slice(-10);

            return newCpuChartData;
        });
        //     });
        // });

        setMemoryChartData((prev) => {
            const newMemoryChartData = [
                ...prev,
                {
                    percentage: memoryPercent,
                    index: (prev.at(-1)?.index ?? 0) + 1
                }
            ].slice(-10);

            return newMemoryChartData;
        });

        memoryCounter.update(data.memory);
        memoryPercentCounter.update(memoryPercent);
        playersCounter.update(data.players);
        tpsCounter.update(data.tps);
        uptimeCounter.update(getUptime(data.uptime));
    }, [
        data,
        cpuCounter.update,
        memoryCounter.update,
        memoryPercentCounter.update,
        playersCounter.update,
        tpsCounter.update,
        uptimeCounter.update,
        memoryPercent,
        getUptime
    ]);

    const [greenVar, textSecVar, alpha300Var, blueVar] = useToken("colors", [
        "green",
        "textSec",
        "alpha300",
        "blue.500"
    ]);

    return (
        <Flex flexDir={"column"} gap={10} w={"100%"}>
            <Flex flexDir={"column"} gap={2} w={"100%"}>
                <Flex
                    gap={2}
                    flexDir={{
                        base: "column",
                        md: "row"
                    }}
                    w={"100%"}
                >
                    <UsageCard
                        title={"CPU Usage"}
                        value={
                            <>
                                <span ref={cpuRef} />%
                            </>
                        }
                        icon={FiCpu}
                    >
                        <VictoryChart
                            height={225}
                            padding={{
                                top: 20,
                                left: 50
                            }}
                        >
                            <VictoryArea
                                data={
                                    cpuChartData.length >= 2
                                        ? cpuChartData
                                        : [
                                              {
                                                  percentage: 0,
                                                  index: 0
                                              }
                                          ]
                                }
                                x={"index"}
                                y={"percentage"}
                                // labelComponent={<VictoryLabel renderInPortal dy={-20} />}
                                animate={{
                                    duration: 2000,
                                    easing: "linear"
                                }}
                                minDomain={{
                                    y: 100
                                }}
                                maxDomain={{
                                    y: 100
                                }}
                                style={{
                                    data: {
                                        fill: `color-mix(in srgb, ${greenVar}, rgba(0, 0, 0, 0))`,
                                        stroke: greenVar,
                                        strokeWidth: 2
                                    }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 100]}
                                style={{
                                    tickLabels: {
                                        fill: textSecVar,
                                        fontSize: 14,
                                        fontFamily: "Montserrat"
                                    },
                                    axis: {
                                        stroke: textSecVar
                                    },
                                    grid: { stroke: alpha300Var, strokeDasharray: "5, 2" }
                                }}
                                tickFormat={(x: number) => {
                                    return `${x}%`;
                                }}
                                gridComponent={<LineSegment />}
                                offsetX={50}
                            />
                        </VictoryChart>
                    </UsageCard>

                    <UsageCard
                        title={"Memory"}
                        value={
                            <>
                                <span ref={memoryRef} />
                                MB/
                                {data.memoryMax}
                                MB (<span ref={memoryPercentRef} />
                                %)
                            </>
                        }
                        icon={FaMemory}
                    >
                        <VictoryChart
                            height={225}
                            padding={{
                                top: 20,
                                left: 50
                            }}
                        >
                            <VictoryArea
                                data={
                                    memoryChartData.length >= 2
                                        ? memoryChartData
                                        : [
                                              {
                                                  percentage: 0,
                                                  index: 0
                                              }
                                          ]
                                }
                                x={"index"}
                                y={"percentage"}
                                // labelComponent={<VictoryLabel renderInPortal dy={-20} />}
                                animate={{
                                    duration: 2000,
                                    easing: "linear"
                                }}
                                minDomain={{
                                    y: 100
                                }}
                                maxDomain={{
                                    y: 100
                                }}
                                style={{
                                    data: {
                                        fill: `color-mix(in srgb, ${blueVar}, rgba(0, 0, 0, 0))`,
                                        stroke: blueVar,
                                        strokeWidth: 2
                                    }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 100]}
                                style={{
                                    tickLabels: {
                                        fill: textSecVar,
                                        fontSize: 14,
                                        fontFamily: "Montserrat"
                                    },
                                    axis: {
                                        stroke: textSecVar
                                    },
                                    grid: { stroke: alpha300Var, strokeDasharray: "5, 2" }
                                }}
                                tickFormat={(x: number) => {
                                    return `${x}%`;
                                }}
                                gridComponent={<LineSegment />}
                                offsetX={50}
                            />
                        </VictoryChart>
                    </UsageCard>
                </Flex>

                <Flex
                    gap={2}
                    flexDir={{
                        base: "column",
                        md: "row"
                    }}
                    w={"100%"}
                >
                    <UsageCard
                        title={"Players"}
                        value={
                            <>
                                <span ref={playersRef} />/{data.maxPlayers}
                            </>
                        }
                        icon={FiUser}
                    />
                    <UsageCard
                        title={"TPS"}
                        value={
                            <>
                                <span ref={tpsRef} />
                            </>
                        }
                        icon={BiServer}
                    />
                    <UsageCard
                        title={"Uptime"}
                        value={
                            <>
                                Online for <span ref={uptimeRef} />
                            </>
                        }
                        icon={BiSolidTime}
                    />
                </Flex>
            </Flex>

            <Console consoleMessages={consoleMessages} sendComamnd={sendComamnd} />
        </Flex>
    );
});

const ConsoleMessage = memo(function ConsoleMessage({ children }: { children: string }) {
    const mcFormattedText = useMinecraftTextFormatting(children);

    const ansiFormattedText = convert.toHtml(mcFormattedText);

    return (
        <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
                __html: ansiFormattedText
            }}
        />
    );
});

const Console = memo(function Console({
    consoleMessages,
    sendComamnd
}: { consoleMessages: string[]; sendComamnd: (command: string) => void }) {
    const consoleMessagesRef = useRef<HTMLDivElement>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useLayoutEffect(() => {
        if (!consoleMessagesRef.current) return;
        consoleMessagesRef.current.scrollTop = consoleMessagesRef.current.scrollHeight;
    }, [consoleMessages]);

    return (
        <Flex flexDir={"column"} gap={4} w={"100%"}>
            <Heading size={"md"}>Console</Heading>

            <Flex
                w={"100%"}
                p={4}
                rounded={"lg"}
                border={"1px solid"}
                borderColor={"alpha300"}
                flexDir={"column"}
                gap={2}
            >
                <Box
                    fontFamily={"monospace"}
                    minH={"400px"}
                    maxH={"400px"}
                    h={"100%"}
                    overflow={"auto"}
                    overflowY={"auto"}
                    ref={consoleMessagesRef}
                >
                    {consoleMessages.length ? (
                        consoleMessages.map((message, index) => (
                            <ConsoleMessage key={`console-message-${index}`}>
                                {message}
                            </ConsoleMessage>
                        ))
                    ) : (
                        <Text color={"textSec"}>Waiting for console messages...</Text>
                    )}
                </Box>

                <InputGroup
                    variant={"filled"}
                    as="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const command = (e.target as any)?.command;

                        if (!command.value) return;

                        sendComamnd(command.value);
                        command.value = "";
                    }}
                >
                    <Input placeholder={"Type a command"} name={"command"} />
                    <InputRightElement>
                        <Button
                            px={10}
                            mr={12}
                            size={"sm"}
                            rounded={"md"}
                            variant={"brand"}
                            rightIcon={<HiMiniCommandLine />}
                            type="submit"
                        >
                            Send
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </Flex>
        </Flex>
    );
});

function UsageCard({
    title,
    value,
    icon,
    children
}: { title: string; value: React.ReactNode; icon: IconType; children?: React.ReactNode }) {
    return (
        <Flex
            w={"100%"}
            p={4}
            direction={"column"}
            gap={2}
            justifyContent={"space-between"}
            rounded={"lg"}
            border={"1px solid"}
            borderColor={"alpha300"}
            alignItems={"center"}
        >
            <Flex
                w={"100%"}
                direction={"row"}
                gap={4}
                justifyContent={"space-between"}
                alignItems={"center"}
            >
                <Flex flexDir={"column"} gap={0.5}>
                    <Text fontSize={"sm"}>{title}</Text>
                    <Text fontWeight={600} fontSize={"xl"}>
                        {value}
                    </Text>
                </Flex>

                <Icon as={icon} boxSize={10} />
            </Flex>
            {children}
        </Flex>
    );
}
