import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, HStack, Heading, Image, Stack, VStack } from "@chakra-ui/react";
import { memo } from "react";
import { AnyServerModel, JavaServerWoDebug, ServerModel } from "~/components/types/minecraftServer";
import StatusIndicator from "./StatusIndicator";

interface Props {
	server: string;
	data: AnyServerModel;
	bedrock: boolean;
}

const bgImageColor = "rgba(0,0,0,.7)";

export default memo(function ServerView({ server, data, bedrock }: Props) {
	return (
		<Stack direction={{ base: "column", md: "row" }} spacing={5} justifyContent={"space-between"} w="100%">
			{!bedrock && (data as unknown as JavaServerWoDebug)?.favicon && (
				<Image
					src={(data as unknown as JavaServerWoDebug)?.favicon ?? ""}
					alt={`${server} favicon`}
					boxSize="170px"
					sx={{ imageRendering: "pixelated" }}
				/>
			)}

			<VStack spacing={4} flexDir={"column"} justifyContent="center" w="100%" h="170px" align={"center"}>
				<Flex flexDir={"row"} alignItems="center" justifyContent={"space-between"} w="100%">
					<HStack as={"a"} target="_blank" href={`http://${server}`}>
						<Heading
							fontSize={{
								base: "md",
								sm: "2xl",
								md: "4xl"
							}}
							letterSpacing={"3px"}
						>
							{server}
						</Heading>
						<ExternalLinkIcon fontSize={"lg"} />
					</HStack>
					<StatusIndicator online={data.online} />
				</Flex>

				<Flex
					py={4}
					flexDir={"column"}
					w="100%"
					pos="relative"
					maxW={"100%"}
					overflowX={"auto"}
					rounded={"3xl"}
					justifyContent="center"
					align={"center"}
					alignItems="center"
				>
					<pre>
						{(data?.motd as unknown as ServerModel.Motd)?.html?.split("\n")?.map((m: string) => (
							<Flex
								key={m}
								dangerouslySetInnerHTML={{
									__html: m
								}}
								w="100%"
								fontFamily={"mono"}
								justifyContent="center"
								align={"center"}
								alignItems="center"
								fontSize={"md"}
								fontWeight={"normal"}
							/>
						))}
					</pre>

					<Box
						rounded={"xl"}
						zIndex={-1}
						pos={"absolute"}
						top="0"
						left="0"
						right="0"
						bottom={"0"}
						bgImage={`linear-gradient(${bgImageColor}, ${bgImageColor}), url(/dirt.png)`}
						bgRepeat={"repeat"}
						bgSize="30px"
					/>
				</Flex>
			</VStack>
		</Stack>
	);
});
