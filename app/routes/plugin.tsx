import { AnimateFrom } from "@/layout/global/Animated";
import config from "@/utils/config";
import { Badge, Box, Button, Divider, Flex, Heading, Icon, Image, Link, Text, useColorMode } from "@chakra-ui/react";
import { HiDownload } from "react-icons/hi";

const pluginName = "imcso insight";

export default function Plugin() {
	const { colorMode } = useColorMode();

	return (
		<Flex flexDir={"column"} maxW="1200px" mx="auto" gap={10} w="100%" mt={20} px={4} pb={20}>
			<AnimateFrom>
				<Heading
					as="h1"
					fontSize={{
						base: "3xl",
						lg: "6xl"
					}}
					ml={4}
				>
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
						image={"https://static.spigotmc.org/img/spigot-og.png"}
						link="/plugin/imcso-insight-1.0.0.jar"
						downloadName="imcso-insight-1.0.0.jar"
						buttonText={"Download for Spigot"}
					/>
				</Flex>
			</AnimateFrom>

			<Flex flexDir={"column"} gap={4}>
				<AnimateFrom delay={0.14}>
					<Divider />
				</AnimateFrom>

				<AnimateFrom delay={0.16}>
					<Text>
						Plugin should be working on any spigot-compatible server and Java version 8 or higher. If you have any
						issues, please join our{" "}
						<Link href={config.discordServerInvite} isExternal variant={"link"}>
							Discord server
						</Link>
						, we'll be happy to help you out. Thanks to{" "}
						<Link href="https://github.com/sieadev" isExternal variant={"link"}>
							SieaDev
						</Link>{" "}
						for providing help with the plugin!
					</Text>
				</AnimateFrom>
			</Flex>
		</Flex>
	);
}

interface DownloadBoxProps {
	image: string;
	link: string;
	downloadName: string;
	buttonText: string;
}

function DownloadBox({ image, buttonText, link, downloadName }: DownloadBoxProps) {
	return (
		<Flex flexDir={"column"} gap={4} w="300px">
			<Image aspectRatio={"1/1"} w="100%" src={image} />
			{/* <Text fontSize={"lg"} fontWeight={500}>
				{title}
			</Text> */}
			<Button variant={"solid"} rightIcon={<Icon as={HiDownload} boxSize={5} />} as="a" href={link} download={downloadName}>
				{buttonText}
			</Button>
		</Flex>
	);
}
