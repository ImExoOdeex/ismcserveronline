import { Box, Flex, HStack, Heading, keyframes, useToken } from "@chakra-ui/react";
import { useMemo } from "react";

interface Props {
	online: boolean;
	onlineColor?: string;
	offlineColor?: string;
}

export default function StatusIndicator({ online, onlineColor = "green", offlineColor = "red.500" }: Props) {
	[onlineColor, offlineColor] = useToken("colors", [onlineColor, offlineColor]);

	const boxShadowInfinityPulse = useMemo(() => {
		return keyframes({
			"0%": {
				boxShadow: `0px 0px 5px 2px ${onlineColor}`
			},
			"100%": {
				boxShadow: `0px 0px 12px 6px ${onlineColor}`
			}
		});
	}, []);

	return (
		<HStack spacing={2}>
			<Flex gap={2} alignItems={"center"} pos="relative">
				<Box
					boxSize={3}
					rounded="full"
					bg={online ? onlineColor : offlineColor}
					animation={`${boxShadowInfinityPulse} 1s infinite alternate`}
					boxShadow={`0px 0px 5px ${onlineColor}`}
				/>
				<Heading fontSize="lg" letterSpacing={"3px"} color={online ? onlineColor : offlineColor}>
					{online ? "Online" : "Offline"}
				</Heading>
				<Flex
					pos="absolute"
					right={0}
					bottom={0}
					left={0}
					h={"2px"}
					bg={online ? onlineColor : offlineColor}
					rounded={"1px"}
				/>
			</Flex>
		</HStack>
	);
}
