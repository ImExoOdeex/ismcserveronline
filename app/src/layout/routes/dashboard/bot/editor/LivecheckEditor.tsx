import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import type { DiscordMessage } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import DiscordMessageEditor from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import { Flex, Text } from "@chakra-ui/react";
import { memo, useState } from "react";

interface Props {
	messages: DiscordMessage[];
	channels: Record<string, string>;
	roles: Record<string, string>;
}

export default memo(function LivecheckEditor({ channels, messages, roles }: Props) {
	const [message, setMessage] = useState<DiscordMessage>(messages[0]);

	const { startAndDone } = useProgressBarContext();
	const fetcher = useDebouncedFetcherCallback((data) => {
		startAndDone();
		console.log("fetcher", data);
	});
	useInsideEffect(() => {
		fetcher.submit(
			{
				message: JSON.stringify(message),
				type: "livecheck"
			},
			{
				debounceTimeout: 1000,
				method: "PATCH"
			}
		);
	}, [message]);

	return (
		<>
			<Flex flexDir={"column"} w="100%" gap={4}>
				<Text fontSize={"xl"} fontWeight={600}>
					Livecheck custom message
				</Text>
				<DiscordMessageEditor
					message={message}
					setMessage={setMessage}
					type="livecheck"
					data={{
						guildData: {
							channels,
							roles
						}
					}}
				/>
			</Flex>
		</>
	);
});
