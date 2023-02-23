import { Heading, Text, VStack } from "@chakra-ui/react";

type Props = {
	system: {
		mem: number;
		totalMem: number;
		usedMem: number;
		platform: string;
		cpu: string;
		processUptimeDays: number;
		nodeVersion: string;
		v8Version: string;
		arch: string;
		mode: string;
	};
};

export default function SystemInfo({ system }: Props) {
	return (
		<VStack align={"start"}>
			<Heading fontSize={"md"}>System info</Heading>
			<Text fontWeight={500}>Mode: {system.mode}</Text>
			<Text fontWeight={500}>
				Process uptime: {system.processUptimeDays} days
			</Text>
			<Text fontWeight={500}>
				Process memory usage: {system.mem.toFixed(0)}MB
			</Text>
			<Text fontWeight={500}>
				System memory: {system.usedMem.toFixed(0)}/
				{system.totalMem.toFixed(0)}
				MB
			</Text>
			<Text fontWeight={500}>
				Platform: {system.platform} {system.arch}, {system.cpu}
			</Text>
			<Text fontWeight={500}>Node version: {system.nodeVersion}</Text>
			<Text fontWeight={500}>V8 engine version: {system.v8Version}</Text>
		</VStack>
	);
}
