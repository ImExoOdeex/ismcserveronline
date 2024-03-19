import { formatBigNumbers } from "@/functions/numbers";
import McModel, { modelConfig } from "@/layout/routes/index/three/McModel";
import { Box, Flex, HStack, Heading, IconButton, Input, Tag, Text, useToken } from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useMemo, useState } from "react";
import { BiSearch } from "react-icons/bi";
import type { SearchTag } from "~/routes/search";

export default function Main({
	bedrockChecked,
	serverValue,
	setBedrockChecked,
	query,
	setServerValue,
	count,
	tags
}: {
	bedrockChecked: boolean;
	serverValue: string;
	query: boolean;
	setBedrockChecked: (e: boolean) => void;
	setServerValue: (e: string) => void;
	count: number;
	tags: SearchTag[];
}) {
	const checksNo = useMemo(() => formatBigNumbers(count), [count]);

	const [textSec] = useToken("colors", ["textSec"]);

	const searchFetcher = useFetcher();
	const [search, setSearch] = useState("");

	const navigate = useNavigate();

	return (
		<Flex gap={10} direction={{ base: "column", md: "row" }} w="100%" justifyContent={"space-between"}>
			<Flex flexDir={"column"} gap={5} zIndex={1}>
				<Heading
					as={"h1"}
					size={{
						base: "xl",
						md: "3xl"
					}}
					lineHeight={"220%"}
					// bgClip={"text"}
					// bgGradient={`linear(to-r, ${textSec}, ${textSec}, ${textSec},  #e29db6, #b397e1, ${textSec})`}
				>
					#1{" "}
					<Box
						pos="relative"
						as="span"
						// bgClip={"text"}
						// bgGradient={`linear(to-r, ${textSec}, ${textSec}, ${textSec}, #e29db6, )`}
						_after={{
							content: '""',
							display: "inline-block",
							pos: "absolute",
							bottom: {
								base: "1px",
								md: "5px"
							},
							left: 0,
							right: 0,
							width: "100%",
							height: {
								base: "3px",
								md: "5px"
							},
							bg: "green.400"
						}}
					>
						Minecraft
					</Box>{" "}
					server list <br /> & real status checker
				</Heading>

				<Text as="h2" fontWeight={600} color="textSec">
					Get information about your favourite Minecraft server for Java or Bedrock edition!
				</Text>

				<Flex flexDir={"column"} gap={2}>
					<HStack w="100%" as={searchFetcher.Form} method="POST">
						<Input
							size={"lg"}
							placeholder="Enter exact server address or search by tags, description, etc."
							variant={"filled"}
							rounded={"xl"}
							name="server"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<IconButton
							type="submit"
							aria-label="Search"
							icon={<BiSearch />}
							size={"lg"}
							variant={"brand"}
							isLoading={searchFetcher.state !== "idle"}
						/>
					</HStack>

					<HStack>
						{tags.map((tag) => (
							<Tag
								size={"lg"}
								onClick={() => {
									navigate(`/search?tag=${tag.name}`);
								}}
								cursor={"pointer"}
								key={tag.name}
							>
								{tag.name}
							</Tag>
						))}
					</HStack>
				</Flex>
			</Flex>

			<Flex flex={1} pos="relative">
				<Flex
					flex={1}
					overflow={"visible"}
					pos="absolute"
					top={0}
					left={0}
					right={0}
					bottom={0}
					w={modelConfig.width + "px"}
					h={modelConfig.height + "px"}
				>
					<McModel />
				</Flex>
			</Flex>
		</Flex>
	);
}
