import { getCookieWithoutDocument } from "@/functions/cookies";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useFetcherCallback from "@/hooks/useFetcherCallback";
import useRootData from "@/hooks/useRootData";
import { Button, Flex, FlexProps, Heading, Input, Text, useToast } from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { memo, useEffect, useRef, useState } from "react";
import { useCountUp } from "react-countup";
import { action, loader } from "~/routes/$server_.vote";

dayjs.extend(relativeTime);

export default memo(function Vote() {
	const { cookies, user } = useRootData();
	const { vote } = useAnimationLoaderData<typeof loader>();

	const toast = useToast();

	const fetcher = useFetcherCallback<typeof action>((data) => {
		if (!data.success) {
			toast({
				title: "Vote failed",
				description: (fetcher.data as any)?.message || "An error occurred while voting",
				status: "error",
				isClosable: true
			});
		}
	});
	const initialSeconds = user?.prime ? 0 : 6;
	const [secondsToVote, setSecondsToVote] = useState(initialSeconds);

	const [startedAnimating, setStartedAnimating] = useState(false);

	const countUpRef = useRef<HTMLSpanElement>(null);
	const { update } = useCountUp({
		ref: countUpRef,
		start: initialSeconds - 1,
		end: initialSeconds - 1,
		useEasing: false,
		onStart: () => {
			setStartedAnimating(true);
		},
		decimals: 2,
		duration: 1
	});

	useEffect(() => {
		if (vote === null) {
			const interval = setInterval(() => {
				setSecondsToVote((prev) => {
					let newSeconds = prev - 1;
					if (newSeconds < 0) newSeconds = 0;
					update(newSeconds - 1);
					if (newSeconds === 0) clearInterval(interval);
					return newSeconds;
				});
			}, 1000);
			return () => clearInterval(interval);
		}
	}, []);

	const [nick, setNick] = useState(getCookieWithoutDocument("last-minecraft-nickname", cookies) || "");

	return (
		<VoteOverlay
			alignItems={{
				base: "flex-start",
				md: "center"
			}}
			flexDir={{
				base: "column",
				md: "row"
			}}
			justifyContent={"space-between"}
			gap={5}
		>
			<Flex flexDir={"column"} gap={1.5}>
				<Heading fontSize={"xl"}>
					{fetcher.data?.success ? (
						"You have voted successfully!"
					) : vote ? (
						"You have already voted for this server."
					) : secondsToVote === 0 ? (
						"You can vote now!"
					) : (
						<>
							You will be able to vote in <span ref={countUpRef} />{" "}
							{!startedAnimating && (initialSeconds - 1).toFixed(2)} seconds
						</>
					)}
				</Heading>

				{vote && (
					<Text color="textSec">
						You will be able to vote again in {dayjs(vote.created_at).add(12, "hours").fromNow(true)}
					</Text>
				)}
			</Flex>

			<Flex
				as={fetcher.Form}
				method="POST"
				w={{
					base: "100%",
					md: "auto"
				}}
				gap={2}
				alignItems={"center"}
			>
				<Input
					type="text"
					name="nick"
					placeholder="Your Minecraft nickname"
					value={nick}
					onChange={(e) => setNick(e.target.value)}
					minLength={3}
					maxLength={16}
					variant={"filled"}
					rounded={"xl"}
					isRequired
					isDisabled={fetcher.data?.success || vote !== null}
				/>

				<Button
					px={6}
					variant={"brand"}
					type="submit"
					isLoading={fetcher.state !== "idle"}
					isDisabled={vote !== null || secondsToVote !== 0 || fetcher.data?.success}
					w={"auto"}
				>
					Vote{fetcher.data?.success ? "d!" : ""}
				</Button>
			</Flex>
		</VoteOverlay>
	);
});

export function VoteOverlay({ children, ...props }: FlexProps) {
	return (
		<Flex p={4} rounded={"xl"} bg="alpha" w="100%" {...props}>
			{children}
		</Flex>
	);
}
