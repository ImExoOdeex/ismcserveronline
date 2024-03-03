import { DiscordMessageType } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import { Code, Divider, Flex, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useMemo } from "react";

interface Props {
	type: DiscordMessageType;
}

export interface Placeholder {
	name: string;
	placeholder: string;
	replaceWith?: string;
}

export const placeholders = {
	livecheck: [
		{
			name: "Server",
			placeholder: "{server}"
		},
		{
			name: "Server Icon",
			placeholder: "{favicon}",
			replaceWith: "https://cdn.discordapp.com/icons/1066548001025310730/9255d155f58573ad7d4fdd6cd497fdbc.webp"
		}
	],
	alert: [
		{
			name: "Server",
			placeholder: "{server}"
		}
	]
} as Record<DiscordMessageType, Placeholder[]>;

export default function Placeholders({ type }: Props) {
	const placeholdersType = useMemo(() => {
		return placeholders[type];
	}, [type]);

	return (
		<Flex
			flexDir={"column"}
			bg="alpha"
			h="min"
			border={"1px solid"}
			borderColor="alpha300"
			rounded={"lg"}
			p={4}
			w={{
				base: "100%",
				md: 80
			}}
			gap={5}
		>
			<Heading fontWeight={600} textAlign={"center"} fontSize={"xl"}>
				Available Placeholders
			</Heading>

			<Flex flexDir={"column"} gap={2}>
				<Text fontWeight={"semibold"} color={"brand"}>
					Placeholders
				</Text>

				<UnorderedList listStyleType={"none"} spacing={1.5} marginInlineStart={"0px"}>
					{placeholdersType.map((pl) => (
						<>
							<Divider />
							<ListItem>
								<Flex flexDir={"column"} gap={0.5}>
									<Text>{pl.name}</Text>
									<Code bg="transparent">{pl.placeholder}</Code>
								</Flex>
							</ListItem>
						</>
					))}
				</UnorderedList>
			</Flex>
		</Flex>
	);
}
