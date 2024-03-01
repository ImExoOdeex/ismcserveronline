import { AnimateFrom } from "@/layout/global/Animated";
import { Badge, Box, Button, Divider, Flex, Heading, Icon, Image, Text, useColorMode } from "@chakra-ui/react";
import { HiDownload } from "react-icons/hi";

const pluginName = "ismcso insight";

export default function Plugin() {
	const { colorMode } = useColorMode();

	return (
		<Flex flexDir={"column"} maxW="1200px" mx="auto" gap={10} w="100%" mt={20} px={4} pb={20}>
			<AnimateFrom>
				<Heading as="h1" fontSize="6xl" ml={4}>
					imcso{" "}
					<Box
						as="span"
						bgClip="text"
						bgGradient={`linear(to-r, ${colorMode === "light" ? "#d16ede" : "#da92e4"}, #866ec7)`}
					>
						Insight
					</Box>{" "}
					Plugin
				</Heading>

				<Divider />
			</AnimateFrom>

			<AnimateFrom delay={0.1}>
				<Text fontSize={"lg"} fontWeight={500}>
					<Badge colorScheme="green">{pluginName}</Badge> is a plugin that allows your server to claim vote rewards by
					users and see real-time statistics of your server in our server panel. When users vote for your server, they
					will be rewarded with in-game items, set up by you. You can customize the rewards and the vote sites to your
					liking. It's win-win! You get better in the server ranking, and your players get rewards for voting.
				</Text>
			</AnimateFrom>

			<AnimateFrom delay={0.12}>
				<Flex gap={10} mx={"auto"} alignItems={"center"} justifyContent={"center"}>
					<DownloadBox
						title={"Spigot version"}
						image={"https://static.spigotmc.org/img/spigot-og.png"}
						buttonText={"Download for Spigot"}
					/>
					<DownloadBox
						title={"Velocity version"}
						image={"https://avatars.githubusercontent.com/u/41710604?s=200&v=4"}
						buttonText={"Download for Velocity"}
					/>
				</Flex>
			</AnimateFrom>
		</Flex>
	);
}

interface DownloadBoxProps {
	title: string;
	image: string;
	buttonText: string;
}

function DownloadBox({ title, image, buttonText }: DownloadBoxProps) {
	return (
		<Flex flexDir={"column"} gap={4} w="300px">
			<Image aspectRatio={"1/1"} w="100%" src={image} />
			<Text fontSize={"lg"} fontWeight={500}>
				{title}
			</Text>
			<Button variant={"brand"} rightIcon={<Icon as={HiDownload} boxSize={5} />}>
				{buttonText}
			</Button>
		</Flex>
	);
}