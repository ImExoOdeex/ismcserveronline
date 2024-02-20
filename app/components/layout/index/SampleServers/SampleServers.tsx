import { Flex, Grid, GridItem, HStack, Heading, Image, Text } from "@chakra-ui/react";
import { Server } from "@prisma/client";
import AddServerPopover from "./AddServerPopover";

type server = { Server: Pick<Server, "server" | "favicon" | "bedrock"> };

export default function SampleServers({
	setServerValue,
	setBedrock,
	sampleServers
}: {
	setServerValue: (s: string) => void;
	setBedrock: (b: boolean) => void;
	sampleServers: server[];
}) {
	return (
		<Flex p={5} rounded={"2xl"} bg={"alpha"} w="100%" flexDir={"column"}>
			<Heading as="h3" fontSize={"lg"}>
				Just looking? Try out these sample servers!
			</Heading>

			<Flex mt={5} w="100%">
				<Grid
					gridTemplateColumns={{
						md: "repeat(2, 1fr)",
						base: "repeat(1, 1fr)"
					}}
					px={{ base: 0, md: 3 }}
					w="100%"
					gap={5 + " !important"}
				>
					{sampleServers.map((s) => (
						<GridItem
							key={"homepage-" + s.Server.server}
							p={3}
							rounded={"lg"}
							bg={"alpha"}
							transform={"auto-gpu"}
							transition={"all .2s"}
							_active={{ scale: 0.95, bg: "alpha200" }}
							_hover={{ bg: "alpha100", textDecor: "none" }}
							onClick={() => {
								setBedrock(false);
								setServerValue(s.Server.server);
								window.scrollTo(0, 0);
							}}
							cursor={"pointer"}
						>
							<HStack spacing={5}>
								<Image
									rounded={"none"}
									src={s.Server.favicon ?? "/favicon.ico"}
									alt={s.Server.server + "'s favicon"}
									width={"64px"}
									height={"64px"}
									sx={{ aspectRatio: "1/1" }}
								/>
								<Text fontWeight={"bold"}>{s.Server.server}</Text>
							</HStack>
						</GridItem>
					))}
					<AddServerPopover />
				</Grid>
			</Flex>
		</Flex>
	);
}
