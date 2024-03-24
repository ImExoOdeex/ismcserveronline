import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import InfiniteScroller from "@/layout/global/InfiniteScroller";
import { CheckIcon, SmallCloseIcon } from "@chakra-ui/icons";
import {
	Badge,
	Flex,
	HStack,
	Heading,
	Skeleton,
	Table,
	TableCaption,
	TableContainer,
	Tbody,
	Td,
	Text,
	Tfoot,
	Th,
	Thead,
	Tr,
	useColorModeValue
} from "@chakra-ui/react";
import { type SOURCE } from "@prisma/client";
import { memo, useCallback, useEffect, useState } from "react";
import type { action } from "~/routes/api.checks";

export interface ICheck {
	id: number;
	source: SOURCE;
	online: boolean;
	players: number;
	checked_at: Date;
}

interface Props {
	serverId: number;
	server: string;
	checks: ICheck[] | null;
	setChecks: React.Dispatch<React.SetStateAction<ICheck[] | null>>;
	skip: number;
	setSkip: React.Dispatch<React.SetStateAction<number>>;
	doneInit: boolean;
	setDoneInit: React.Dispatch<React.SetStateAction<boolean>>;
}

export default memo(function ChecksTable({ server, serverId, checks, setChecks, setSkip, skip, doneInit, setDoneInit }: Props) {
	const borderColor = useColorModeValue("#2f2e32", "#2f2e32 !important");

	// fetcher to fetch data
	const fetcher = useDebouncedFetcherCallback<typeof action>((data) => {
		if (data.checks) {
			setChecks((prev) => [...(prev || []), ...data.checks]);
			setSkip((skip) => skip + 20);

			if (data.checks.length < 20) {
				setEnded(true);
			}
		}
	});

	const load = useCallback(() => {
		fetcher.submit(
			{
				c: skip,
				serverId
			},
			{
				action: `/api/checks`,
				method: "POST"
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher, server, skip]);

	useEffect(() => {
		if (!doneInit) {
			fetcher.submit(
				{
					c: skip,
					serverId
				},
				{
					action: `/api/checks`,
					method: "POST"
				}
			);

			setDoneInit(true);
			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checks]);

	const [ended, setEnded] = useState(false);

	return (
		<>
			{checks ? (
				<>
					{checks.length ? (
						<InfiniteScroller loading={fetcher.state !== "idle"} loadNext={load} ended={ended}>
							<TableContainer w="100%" __css={{ clear: "both" }}>
								<Table variant="simple" size={"sm"}>
									<TableCaption>Last status checks for {server}</TableCaption>
									<Thead>
										<Tr sx={{ "> *": { borderColor: borderColor } }}>
											<Th>Date</Th>
											<Th>Status</Th>
											<Th>Platform</Th>
											<Th isNumeric>Players</Th>
										</Tr>
									</Thead>
									<Tbody>
										{checks.map((c) => {
											return <Check key={c.id + c.checked_at.toString()} check={c} />;
										})}

										{fetcher.state !== "idle" && <SkeletonChecks />}
									</Tbody>
									<Tfoot __css={{ clear: "both" }}>
										<Tr>
											<Th>Date</Th>
											<Th>Status</Th>
											<Th>Platform</Th>
											<Th isNumeric>Players</Th>
										</Tr>
									</Tfoot>
								</Table>
							</TableContainer>
						</InfiniteScroller>
					) : (
						<Flex w="100%">
							<Heading fontSize={"md"} justifySelf="center" textAlign="center" color={"red"} mx="auto">
								There were no checks
							</Heading>
						</Flex>
					)}
				</>
			) : (
				<>
					<TableContainer w="100%" __css={{ clear: "both" }}>
						<Table variant="simple" size={"sm"}>
							<TableCaption>Last status checks for {server}</TableCaption>
							<Thead>
								<Tr sx={{ "> *": { borderColor: borderColor } }}>
									<Th>Date</Th>
									<Th>Status</Th>
									<Th>Platform</Th>
									<Th isNumeric>Players</Th>
								</Tr>
							</Thead>
							<Tbody>
								<SkeletonChecks />
							</Tbody>
							<Tfoot __css={{ clear: "both" }}>
								<Tr>
									<Th>Date</Th>
									<Th>Status</Th>
									<Th>Platform</Th>
									<Th isNumeric>Players</Th>
								</Tr>
							</Tfoot>
						</Table>
					</TableContainer>
				</>
			)}
		</>
	);
});

const Check = memo(function Check({ check }: { check: ICheck }) {
	const discordBg = useColorModeValue("rgba(88, 101, 242, 0.16)", "rgba(88, 147, 242, 0.12)");
	const discordColor = useColorModeValue("discord.100", "#6f9ce6");
	const apiColor = useColorModeValue("blue.500", "blue.200");

	return (
		<Tr key={check.id + check.checked_at.toString()} _hover={{ bg: "alpha" }} transition="background .05s">
			<Td>{new Date(check.checked_at).toLocaleString()}</Td>
			<Td>
				{check.online ? (
					<HStack rounded={"md"} color="green" bg={"rgba(72, 187, 120, 0.1)"} w="min-content" px={3} py={1}>
						<Text textTransform={"none"} fontWeight={600}>
							Online
						</Text>
						<CheckIcon />
					</HStack>
				) : (
					<HStack rounded={"md"} color="red" bg={"rgba(187, 72, 72, 0.1)"} w="min-content" px={3} py={1}>
						<Text textTransform={"none"}>Offline</Text>
						<SmallCloseIcon />
					</HStack>
				)}
			</Td>
			<Td>
				<Badge
					rounded={"md"}
					fontWeight={700}
					px={3}
					py={1}
					bg={check.source == "WEB" ? "alpha200" : check.source == "DISCORD" ? discordBg : "rgba(144, 206, 244, 0.16)"}
					color={check.source == "WEB" ? "text" : check.source == "DISCORD" ? discordColor : apiColor}
				>
					{check.source}
				</Badge>
			</Td>
			<Td isNumeric>{check.players}</Td>
		</Tr>
	);
});

const SkeletonChecks = memo(function SkeletonChecks() {
	return (
		<>
			{Array.from({ length: 20 }, (v, i) => i).map((c: number) => {
				return (
					<Tr key={c} _hover={{ bg: "alpha" }} transition="background .05s">
						<Td>
							<Skeleton h={3} w="45%" startColor="alpha200" endColor="alpha" />
						</Td>
						<Td>
							<Skeleton h={3} w="43%" startColor="alpha200" endColor="alpha" />
						</Td>
						<Td>
							<Skeleton h={3} w="45%" startColor="alpha200" endColor="alpha" />
						</Td>
						<Td isNumeric>
							<Flex w="100%" alignItems={"end"} justifyContent={"end"}>
								<Skeleton h={3} w="30%" startColor="alpha200" endColor="alpha" />
							</Flex>
						</Td>
					</Tr>
				);
			})}
		</>
	);
});
