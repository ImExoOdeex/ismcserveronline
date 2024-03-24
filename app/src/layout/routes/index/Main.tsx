import dynamic from "@/functions/dynamic";
import { Box, Flex, Heading, HStack, IconButton, Input, Tag, Text, useMediaQuery } from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Suspense, useState } from "react";
import { BiSearch } from "react-icons/bi";
import type { SearchTag } from "~/routes/search";

const McModel = dynamic(() => {
	const isMobile = window.innerWidth < 1024;
	// dont load model on mobile
	if (isMobile) {
		return import("@/layout/routes/index/three/Empty");
	}
	return import("@/layout/routes/index/three/McModel");
});

export const modelConfig = {
	model: "blahaj.glb",
	width: 1000,
	height: 1000
};

export default function Main({ tags }: { tags: SearchTag[] }) {
	const searchFetcher = useFetcher();
	const [search, setSearch] = useState("");

	const navigate = useNavigate();

	const [isMobile] = useMediaQuery("(max-width: 1024px)", {
		fallback: true,
		ssr: true
	});

	return (
		<Flex gap={10} direction={{ base: "column", md: "row" }} w="100%" justifyContent={"space-between"}>
			<Flex flexDir={"column"} gap={6} zIndex={1}>
				<Heading
					as={"h1"}
					size={{
						base: "xl",
						md: "3xl"
					}}
					lineHeight={"220%"}
				>
					<Box as="span" bgClip={"text"} bgGradient={`linear(to-r, #8167d9, #e380a4)`}>
						#1{" "}
					</Box>
					Minecraft server list
					<br /> &{" "}
					<Box
						pos="relative"
						as="span"
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
						real
					</Box>{" "}
					status checker
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

					<HStack overflow={"auto"}>
						{tags.map((tag) => (
							<Tag
								minW={"fit-content"}
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

			{!isMobile && (
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
						<Suspense fallback={<></>}>
							<McModel />
						</Suspense>
					</Flex>
				</Flex>
			)}
		</Flex>
	);
}
