import { MinecraftImage } from "@/.server/minecraftImages";
import useGlobalContext from "@/hooks/useGlobalContext";
import { ChakraBox } from "@/layout/global/MotionComponents";
import { AnyServer, JavaServerWoDebug } from "@/types/minecraftServer";
import config from "@/utils/config";
import { Badge, Flex, FlexProps, Heading, Image, Link, VStack } from "@chakra-ui/react";
import { AnimatePresence, Transition, motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import StatusIndicator from "./StatusIndicator";

interface Props {
	server: string;
	data: AnyServer;
	bedrock: boolean;
	image: MinecraftImage;
	verified: boolean;
}

export default memo(function ServerView({ server, data, bedrock, image, verified, ...props }: Props & FlexProps) {
	const [isOpen, setIsOpen] = useState(false);

	const { updateData } = useGlobalContext();

	useEffect(() => {
		updateData("gradientColor", data.online ? "green" : "red");
	}, [data.online]);

	return (
		<Flex flexDir={"column"} pos="relative" {...props}>
			<Flex pos="relative">
				{image.credits && (
					<Link
						pos="absolute"
						top={1}
						right={2}
						href={image.credits}
						target="_blank"
						rel="noopener noreferrer"
						fontSize={"sm"}
						fontWeight={"600"}
						color={"textSec"}
						opacity={0.4}
						zIndex={1}
					>
						Credits
					</Link>
				)}
				<AnimatePresence initial={false}>
					<Image
						as={motion.img}
						onMouseEnter={() => setIsOpen(true)}
						onMouseLeave={() => setIsOpen(false)}
						animate={{
							height: isOpen ? "100%" : 36 * 4
						}}
						h={4}
						src={image.url}
						w="100%"
						rounded={"lg"}
						alt={image.name}
						objectPosition={"center"}
						objectFit={"cover"}
						transition={
							{
								duration: 0.6,
								ease: config.ease
							} satisfies Transition as any
						}
						sx={{
							// sharpens the image
							imageRendering: "crisp-edges"
						}}
					/>
				</AnimatePresence>
				<Image
					as={motion.img}
					transition={
						{
							duration: 0.6,
							ease: config.ease
						} satisfies Transition as any
					}
					animate={{
						height: isOpen ? "100%" : "110%",
						scale: 1.02,
						y: isOpen ? 0 : "-5%"
					}}
					pos={"absolute"}
					top={0}
					left={0}
					right={0}
					bottom={0}
					h={"100%"}
					src={image.url}
					blur={10}
					w="100%"
					rounded={"lg"}
					alt={image.name}
					objectPosition={"center"}
					objectFit={"cover"}
					zIndex={-1}
					filter={"blur(16px)"}
				/>
			</Flex>

			<AnimatePresence initial={false}>
				<ChakraBox
					display={"flex"}
					flexDir={{ base: "column", md: "row" }}
					gap={5}
					justifyContent={"space-between"}
					mx={{
						base: 2,
						md: 10
					}}
					px={5}
					py={2}
					rounded={"lg"}
					shadow={"lg"}
					pos="absolute"
					left={0}
					right={0}
					bottom={0}
					animate={{
						y: isOpen ? "90%" : "75%"
					}}
					transition={
						{
							duration: 0.5,
							ease: config.ease
						} as Transition as any
					}
					transform={"translateY(50%)"}
					backdropFilter={"blur(32px) brightness(0.7)"}
				>
					{!bedrock && (data as unknown as JavaServerWoDebug)?.favicon && (
						<Image
							src={(data as unknown as JavaServerWoDebug)?.favicon ?? ""}
							alt={`${server} favicon`}
							boxSize={36}
							sx={{ imageRendering: "pixelated" }}
						/>
					)}

					<VStack spacing={4} flexDir={"column"} justifyContent="center" w="100%" align={"center"}>
						<Flex flexDir={"row"} alignItems="center" justifyContent={"space-between"} w="100%">
							{/* <HStack as={"a"} target="_blank" href={`http://${server}`}> */}
							<Flex flexDir={"column"}>
								<Heading
									as={"a"}
									target="_blank"
									href={`http://${server}`}
									color={"whiteAlpha.800"}
									fontSize={{
										base: "md",
										sm: "2xl",
										md: "4xl"
									}}
									letterSpacing={"3px"}
								>
									{server}
								</Heading>

								{verified && (
									<Badge colorScheme="orange" w="min-content">
										Verified
									</Badge>
								)}
							</Flex>
							<StatusIndicator online={data.online} />
						</Flex>
					</VStack>
				</ChakraBox>
			</AnimatePresence>
		</Flex>
	);
});
