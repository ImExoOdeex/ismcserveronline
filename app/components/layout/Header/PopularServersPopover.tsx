import { HStack, Heading, Image, PopoverArrow, PopoverBody, PopoverContent, Spinner, Text, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "~/components/utils/Link";

export default function PopularServersPopover({ server }: { server: string }) {
	const fetcher = useFetcher();

	useEffect(() => {
		if (server.length >= 1) {
			fetcher.load(`/api/autocomplete/${server}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [server]);

	const busy = fetcher.state !== "idle";

	const [active, setActive] = useState(0);

	const results = useMemo(
		() => {
			if (server.length < 2) return [];
			fetcher.load(`/api/autocomplete/${server}`);
			return (fetcher.data as any)?.complete;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[server]
	);

	// const onKeyDown = useCallback(
	// 	(e: React.KeyboardEvent) => {
	// 		// @ts-ignore
	// 		eventRef.current = "keyboard";
	// 		switch (e.key) {
	// 			case "ArrowDown": {
	// 				e.preventDefault();
	// 				if (active + 1 < results.length) {
	// 					setActive(active + 1);
	// 				}
	// 				break;
	// 			}
	// 			case "ArrowUp": {
	// 				e.preventDefault();
	// 				if (active - 1 >= 0) {
	// 					setActive(active - 1);
	// 				}
	// 				break;
	// 			}
	// 			case "Control":
	// 				break;
	// 			case "Alt":
	// 				break;
	// 			case "Enter": {
	// 				if (results?.length <= 0) {
	// 					break;
	// 				}
	// 				onClose();
	// 				// @ts-ignore
	// 				navigate("/srednie/" + results[active].slug);
	// 				break;
	// 			}
	// 		}
	// 	},
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// 	[active, fetcher]
	// );

	const onKeyUp = useCallback((e: React.KeyboardEvent) => {
		// @ts-ignore
		eventRef.current = "keyboard";
	}, []);

	return (
		<PopoverContent bg="bg" minW={{ base: "auto", sm: "400px" }} rounded={"xl"}>
			<PopoverArrow bg="bg" />
			<PopoverBody>
				{busy ? (
					<HStack>
						<Text>Loading</Text>
						<Spinner size={"sm"} />
					</HStack>
				) : results ? (
					<VStack w="100%" align={"start"} spacing={3}>
						{results.map((s: { id: number; server: string; icon: string }) => (
							<HStack
								key={s.id}
								bg={"rgba(86, 59, 159, 0.1)"}
								rounded={"lg"}
								as={Link}
								to={`/${s.server}`}
								w="100%"
								p={2}
								_hover={{ textDecor: "none" }}
							>
								<Image
									boxSize={16}
									src={s.icon}
									alt={`${s.server}'s icon`}
									rounded={"sm"}
									sx={{ imageRendering: "pixelated" }}
								/>
								<Heading as={"h3"} fontSize={"md"}>
									{s.server}
								</Heading>
							</HStack>
						))}
					</VStack>
				) : (
					<Heading fontSize={"md"} textAlign={"center"} w="100%">
						Start typing to get autocomplete
					</Heading>
				)}
			</PopoverBody>
		</PopoverContent>
	);
}
