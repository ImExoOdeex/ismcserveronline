import { decimalToHex } from "@/functions/colors";
import useFormattedDiscordText, { usePlaceholdersReplaced } from "@/hooks/useFormattedDiscordText";
import { DiscordMessage } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import { placeholders } from "@/layout/routes/dashboard/bot/editor/Placeholders";
import { Flex, GridItem, Heading, Image, Link, SimpleGrid, Text, VStack } from "@chakra-ui/react";

interface Props {
	message: DiscordMessage;
}

export default function EmbedPreview({ message }: Props) {
	const description = useFormattedDiscordText(message.embed?.description ?? "");
	const title = useFormattedDiscordText(message.embed?.title ?? "");
	const author = useFormattedDiscordText(message.embed?.author?.name ?? "");
	const footer = useFormattedDiscordText(message.embed?.footer?.text ?? "");

	const thumbnail = usePlaceholdersReplaced(message.embed?.thumbnail?.url ?? "", placeholders[message.type]);
	const image = usePlaceholdersReplaced(message.embed?.image?.url ?? "", placeholders[message.type]);

	return (
		<Flex
			rounded={4}
			flexDir={"column"}
			borderLeftWidth={"4px"}
			borderColor={decimalToHex(message.embed.color ?? 0)}
			transition={"border-color 0.15s ease"}
			minW={"408px"}
			w="100%"
			align={"start"}
			bg={"blackAlpha.200"}
			p={2}
			gap={2}
			fontSize={"16px"}
		>
			<Flex flexDir={"row"} w="100%">
				<VStack w="100%" align={"start"} spacing={1}>
					{/* main */}

					{/* Author */}
					{message.embed.author && (
						<Flex mt={2} gap={2}>
							{message.embed.author.icon_url && (
								<Image boxSize={6} rounded={"full"} src={message.embed.author.icon_url} />
							)}
							<Link href={message.embed.author.url || ""} isExternal>
								{author}
							</Link>
						</Flex>
					)}

					{/* Body */}
					{message.embed.title && (
						<Link href={message.embed.url ?? ""}>
							<Heading fontWeight={600} fontSize={"lg"}>
								{title}
							</Heading>
						</Link>
					)}

					{message.embed.description && <Text>{description}</Text>}

					{message.embed.fields && (
						<SimpleGrid display={"inline-grid"} gap={2} w={"100%"} columns={3}>
							{message.embed.fields.map((field, i) => (
								<Field field={field} key={i} />
							))}
						</SimpleGrid>
					)}
				</VStack>
				{/* thumbnail */}
				{message.embed.thumbnail.url && (
					<Image
						ml={2}
						maxW={"80px"}
						h="min-content"
						objectFit={"contain"}
						objectPosition={"top"}
						rounded={"lg"}
						mt={4}
						src={thumbnail}
						alt={thumbnail}
					/>
				)}
			</Flex>

			{/* image */}
			{message.embed?.image?.url && <Image maxW={"400px"} w="100%" rounded={"lg"} mt={4} src={image} alt={image} />}

			{/* footer */}
			{message.embed?.footer && (
				<Flex mt={2} gap={2} alignItems={"center"}>
					{message.embed?.footer?.icon_url && (
						<Image
							boxSize={5}
							rounded={"md"}
							src={message.embed?.footer?.icon_url}
							alt={message.embed?.footer?.icon_url}
						/>
					)}

					<Text fontSize={"sm"} opacity={0.8}>
						{footer}
					</Text>

					{/* {message.timestamp && (
						<Text fontSize={"sm"} opacity={0.8}>
							•{" "}
							{new Intl.DateTimeFormat("en-US").format(
								new Date(message.timestamp)
							)}
						</Text>
					)} */}
				</Flex>
			)}
		</Flex>
	);
}

function Field({ field }: { field: DiscordMessage["embed"]["fields"][number] }) {
	const value = useFormattedDiscordText(field.value ?? "");

	return (
		<GridItem mt={2} w="auto" colSpan={field.inline ? 1 : 3}>
			{field.name && (
				<Text fontSize={"sm"} fontWeight={600}>
					{field.name}
				</Text>
			)}
			{field.value && (
				<Text opacity={0.8} textStyle={"sm"}>
					{value}
				</Text>
			)}
		</GridItem>
	);
}
