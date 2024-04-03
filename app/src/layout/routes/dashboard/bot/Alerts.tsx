import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import type useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import Select from "@/layout/global/Select";
import { Flex, Switch, Text, Tooltip, VisuallyHiddenInput } from "@chakra-ui/react";
import { memo, useState } from "react";
import type { loader } from "~/routes/dashboard.bot.$guildID._index";

interface Props {
	livecheckFetcher: ReturnType<typeof useDebouncedFetcherCallback>;
}

export default memo(function Alerts({ livecheckFetcher }: Props) {
	const { livecheck, channels } = useAnimationLoaderData<typeof loader>();

	const [alertEnabled, setAlertEnabled] = useState(livecheck?.alert_enabled ?? false);
	const [alertChannel, setAlertChannel] = useState(livecheck?.alert_channel ?? "");

	useInsideEffect(() => {
		livecheckFetcher.submit(
			{
				_action: "alert",
				alertEnabled: alertEnabled,
				alertChannel: alertChannel
			},
			{
				method: "PATCH",
				debounceTimeout: 10
			}
		);
	}, [alertEnabled, alertChannel]);

	return (
		<>
			<Tooltip label={"You can't set up alerts, when livecheck is disabled."} isDisabled={!!livecheck} hasArrow>
				<Flex flexDir={"column"} gap={4} w="100%" opacity={livecheck ? 1 : 0.5}>
					<Flex flexDir={"row"} w="100%" justifyContent={"space-between"} pointerEvents={livecheck ? "auto" : "none"}>
						<Flex flexDir={"column"} gap={0}>
							<Text fontWeight={600}>Enable Alerts</Text>
							<Text color={"textSec"}>Get notified when a user goes offline.</Text>
						</Flex>

						<Switch
							size="lg"
							colorScheme="brand"
							isChecked={alertEnabled}
							onChange={(e) => setAlertEnabled(e.target.checked)}
						/>
						<VisuallyHiddenInput name="alertEnabled" value={alertEnabled.toString()} readOnly />
					</Flex>

					{alertEnabled && (
						<Flex
							flexDir={{
								base: "column",
								md: "row"
							}}
							gap={2}
							w="100%"
							justifyContent={"space-between"}
						>
							<Flex flexDir={"column"} gap={0}>
								<Text fontWeight={600}>Alert Channel</Text>
								<Text color={"textSec"}>Select a channel you'd like to be notified in.</Text>
							</Flex>

							<Select
								name="alertChannel"
								variant={"filled"}
								value={{
									label: channels.find((channel) => channel.id === alertChannel)?.name ?? "Select a channel",
									value: alertChannel
								}}
								onChange={(value) => setAlertChannel(value?.value ?? "")}
								options={channels.map((channel: { name: string; id: string }) => ({
									label: `#${channel.name}`,
									value: channel.id
								}))}
								container={{
									w: "300px"
								}}
							/>
						</Flex>
					)}
				</Flex>
			</Tooltip>
		</>
	);
});
