import { Icon } from "@chakra-ui/icons";
import { Flex, Text } from "@chakra-ui/react";
import { memo, useEffect, useRef } from "react";
import { useCountUp } from "react-countup";
import type { IconType } from "react-icons";
import { BiServer, BiSolidTime } from "react-icons/bi";
import { FaMemory } from "react-icons/fa";
import { FiCpu, FiUser } from "react-icons/fi";
import type { Usage } from "../../../../../../../server/wsserver";

export default memo(function RealTimeConnected({ data }: { data: Usage }) {
	const memoryPercent = (data.memory / data.memoryMax) * 100;

	const duration = 2;
	const useEasing = false;

	const cpuRef = useRef(null);
	const cpuCounter = useCountUp({
		start: 0,
		ref: cpuRef,
		end: Math.round(data.cpu * 100),
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

	const maxMemoryRef = useRef(null);
	const maxMemoryCounter = useCountUp({
		start: 0,
		ref: maxMemoryRef,
		end: data.memoryMax,
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

	const uptimeRef = useRef(null);
	const uptimeCounter = useCountUp({
		start: 0,
		ref: uptimeRef,
		end: data.uptime / 1000 / 60,
		useEasing,
		duration
	});

	useEffect(() => {
		cpuCounter.update(Math.round(data.cpu * 100));
		memoryCounter.update(data.memory);
		maxMemoryCounter.update(data.memoryMax);
		memoryPercentCounter.update(memoryPercent);
		playersCounter.update(data.players);
		tpsCounter.update(data.tps);
		uptimeCounter.update(data.uptime / 1000 / 60);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	return (
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
				/>
				<UsageCard
					title={"Memory"}
					value={
						<>
							<span ref={memoryRef} />
							MB/
							<span ref={maxMemoryRef} />
							MB (<span ref={memoryPercentRef} />
							%)
						</>
					}
					icon={FaMemory}
				/>
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
							Online for <span ref={uptimeRef} />m
						</>
					}
					icon={BiSolidTime}
				/>
			</Flex>
		</Flex>
	);
});

function UsageCard({ title, value, icon }: { title: string; value: React.ReactNode; icon: IconType }) {
	return (
		<Flex
			w={"100%"}
			p={4}
			direction={"row"}
			gap={4}
			justifyContent={"space-between"}
			rounded={"lg"}
			border={"1px solid"}
			borderColor={"alpha300"}
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
	);
}
