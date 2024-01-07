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
import { ScrollRestoration, useFetcher } from "@remix-run/react";
import debounce from "lodash.debounce";
import { useEffect, useMemo, useRef, useState } from "react";

type Check = {
	id: number;
	server: string;
	source: SOURCE;
	online: boolean;
	players: number;
	checked_at: Date;
};

type Props = {
	server: string;
	checks: Check[];
};

export default function ChecksTable({ server, checks }: Props) {
	const borderColor = useColorModeValue("#2f2e32", "#2f2e32 !important");
	const discordBg = useColorModeValue("rgba(88, 101, 242, 0.16)", "rgba(88, 147, 242, 0.12)");
	const discordColor = useColorModeValue("discord.100", "#6f9ce6");
	const apiColor = useColorModeValue("blue.500", "blue.200");

	const [checksState, setChecksState] = useState(checks);

	// positions states
	const [scrollPosition, setScrollPosition] = useState(0);
	const [clientHeight, setClientHeight] = useState(0);

	// use effet to run event that will update our scroll position
	useEffect(() => {
		function scrollListener() {
			setClientHeight(window.innerHeight);
			setScrollPosition(window.scrollY);
		}
		if (typeof window !== "undefined") {
			window.addEventListener("scroll", scrollListener);
		}
		return () => {
			window.removeEventListener("scroll", scrollListener);
		};
	}, []);

	const divHeight = useRef<HTMLTableSectionElement>(null);

	const tableReactPosFromTop = divHeight?.current?.getBoundingClientRect()?.top ?? 0 + scrollPosition;

	const pos = useMemo(() => {
		return clientHeight + scrollPosition;
	}, [clientHeight, scrollPosition]);

	const [shouldFetch, setShouldFetch] = useState(true);

	// skip elements state (step by 20)
	const [skip, setSkip] = useState(20);
	// fetcher to fetch data
	const fetcher = useFetcher();

	const loadDebounced = debounce(() => {
		console.warn("fetching");

		setShouldFetch(false);
		fetcher.load(`/api/checks/get?c=${skip}&server=${server}`);
	}, 150);

	const inital = useRef(true);

	useEffect(() => {
		if (inital.current) {
			inital.current = false;
			return;
		}
		console.table({
			pos: pos - 500,
			tableReactPosFromTop
		});

		// if our position if greater than expected, we'll fetch the data from our API route
		if (!tableReactPosFromTop || !shouldFetch) return;
		if (pos - 500 < tableReactPosFromTop) return;

		loadDebounced();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clientHeight, scrollPosition]);

	useEffect(() => {
		// discontinue API calls if the last page has been reached
		if (fetcher.data && (fetcher.data as any).checks.length === 0) {
			setShouldFetch(false);
			return;
		}

		// if our fetcher is not empty, we add items to state
		if ((fetcher.data as any)?.checks) {
			setChecksState((prev) => [...prev, ...(fetcher?.data as any)?.checks]);
			setSkip((skip: number) => skip + 20);
			setShouldFetch(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return (
		<>
			{checks.length ? (
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
							{checksState.map((c: Check) => {
								return (
									<Tr
										key={c.id + c.checked_at.toString()}
										_hover={{ bg: "alpha" }}
										transition="background .05s"
										sx={{
											"> *": { borderColor: borderColor }
										}}
									>
										<Td>{new Date(c.checked_at).toLocaleString()}</Td>
										<Td>
											{c.online ? (
												<HStack
													rounded={"md"}
													color="green"
													bg={"rgba(72, 187, 120, 0.1)"}
													w="min-content"
													px={3}
													py={1}
												>
													<Text textTransform={"none"} fontWeight={600}>
														Online
													</Text>
													<CheckIcon />
												</HStack>
											) : (
												<HStack
													rounded={"md"}
													color="red"
													bg={"rgba(187, 72, 72, 0.1)"}
													w="min-content"
													px={3}
													py={1}
												>
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
												bg={
													c.source == "WEB"
														? "alpha200"
														: c.source == "DISCORD"
														? discordBg
														: "rgba(144, 206, 244, 0.16)"
												}
												color={
													c.source == "WEB" ? "text" : c.source == "DISCORD" ? discordColor : apiColor
												}
											>
												{c.source}
											</Badge>
										</Td>
										<Td isNumeric>{c.players}</Td>
									</Tr>
								);
							})}

							{fetcher.state !== "idle" && (
								<>
									{Array.from({ length: 20 }, (v, i) => i).map((c: number) => {
										return (
											<Tr
												key={c}
												_hover={{ bg: "alpha" }}
												transition="background .05s"
												sx={{
													"> *": {
														borderColor: borderColor
													}
												}}
											>
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
							)}
						</Tbody>
						<ScrollRestoration />
						<Tfoot ref={divHeight} __css={{ clear: "both" }}>
							<Tr>
								<Th>Date</Th>
								<Th>Status</Th>
								<Th>Platform</Th>
								<Th isNumeric>Players</Th>
							</Tr>
						</Tfoot>
					</Table>
				</TableContainer>
			) : (
				<Flex w="100%">
					<Heading fontSize={"md"} justifySelf="center" textAlign="center" color={"red"} mx="auto">
						There were no checks
					</Heading>
				</Flex>
			)}
		</>
	);
}
