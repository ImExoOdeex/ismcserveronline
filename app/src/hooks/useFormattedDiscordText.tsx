import { Placeholder } from "@/layout/routes/dashboard/bot/editor/Placeholders";
import type { CodeProps } from "@chakra-ui/react";
import { Box, Code, Image, Text, useColorModeValue } from "@chakra-ui/react";
import Color from "color";
import type { ReactNode } from "react";
import React, { memo, useMemo } from "react";
import config from "../utils/config";

export interface FormatData {
	guildData: {
		roles: Record<string, string>;
		channels: Record<string, string>;
		// emotes: string[];
	};
}

function processLine(line: string, mentionBg: string, data?: FormatData) {
	const words: ReactNode[] = [];

	const mentionStyles = {
		bg: mentionBg,
		textColor: "white",
		_hover: { bg: "#5865f2" },
		cursor: "pointer",
		fontWeight: 500,
		w: "max",
		fontFamily: "Montserrat",
		transition: `all 0.2s ${config.ease.join(", ")}`
	} as CodeProps;

	function findKeyFromValue(value: string, type: "channels" | "roles") {
		if (!value) return null;
		if (!data?.guildData?.[type]) return null;

		console.log(data.guildData[type], value);

		const foundObject = (data.guildData[type] as any).find((v: any) => v.id === value);
		if (!foundObject) return null;

		const found = foundObject.name;

		if (!found) return null;

		return foundObject as Record<string, string>;
	}

	function processWord(word: string, index: number, isFirstInLine: boolean) {
		if (!word) return words.push(<></>);

		if (word.startsWith(">") && isFirstInLine)
			words.push(<Box key={index} as="span" borderLeft="7px" bgColor={"#4e5058"} pl={1} mr={1} borderRadius="md" />);
		else if (word.match(/```([^`]+?)```/g)) words.push(word?.replaceAll("```", ""));
		else if (word.match(/\*\*([^*]+?)\*\*/g)) words.push(<Text as="b">{word?.replaceAll("**", "")}</Text>);
		else if (word.match(/__([^_]+?)__/g)) words.push(<Text as="i">{word?.replaceAll("__", "")}</Text>);
		else if (word.match(/\*([^*\n]+?)\*/g)) words.push(<Text as="em">{word?.replaceAll("*", "")}</Text>);
		else if (word.match(/\_([^_\n]+?)\_/g)) words.push(<Text as="em">{word?.replaceAll("_", "")}</Text>);
		else if (word.match(/~~([^~]+?)~~/g)) words.push(<Text as="s">{word?.replaceAll("~~", "")}</Text>);
		else if (word.match(/\|\|([^|\n]+?)\|\|/g))
			words.push(
				<Box as="span" bg="yellow">
					{word?.replaceAll("||", "")}
				</Box>
			);
		else if (word.match(/`([^`\n]+?)`/g))
			words.push(
				<Code key={index} bg="#2b2d31">
					{word?.replaceAll("`", "")}
				</Code>
			);
		else if (word.match(/@(\d+)/g))
			words.push(
				<Code key={index} {...mentionStyles}>
					{"@user"}
				</Code>
			);
		else if (word.match(/@everyone/g))
			words.push(
				<Code key={index} {...mentionStyles}>
					{"@everyone"}
				</Code>
			);
		else if (word.match(/@!?(\d+)/g))
			words.push(
				<Code key={index} {...mentionStyles}>
					{"@user"}
				</Code>
			);
		else if (word.match(/@&(\d+)/g)) {
			const obj = findKeyFromValue(word?.split("&")[1]?.replaceAll(">", ""), "roles");

			words.push(
				<Code
					key={index}
					{...mentionStyles}
					{...{
						color: obj ? obj.color : undefined,
						bg: obj ? `${Color(obj.color).alpha(0.2).string()}` : undefined,
						_hover: obj ? { bg: `${Color(obj.color).alpha(0.3).string()}` } : undefined
					}}
				>
					{obj ? `@${obj.name}` : "@role"}
				</Code>
			);
		} else if (word.match(/#(\d+)/g)) {
			const obj = findKeyFromValue(word?.split("#")[1]?.replaceAll(">", ""), "channels");

			words.push(
				<Code key={index} {...mentionStyles}>
					{obj ? `#${obj.name}` : "#channel"}
				</Code>
			);
		} else if (word.match(/<a?:(\d+)>/g))
			words.push(
				<Image
					src={`https://cdn.discordapp.com/emojis/${word?.split(":")[2]?.replaceAll(">", "")}.webp`}
					alt={"previewImage"}
					objectFit={"cover"}
					draggable={false}
					cursor={"pointer"}
					w={"auto"}
					boxSize={4}
				/>
			);
		else if (word.match(/<a?:[a-zA-Z0-9_]+:(\d+)>/g))
			words.push(
				<Image
					src={`https://cdn.discordapp.com/emojis/${word?.split(":")[2]?.replaceAll(">", "")}.webp`}
					alt={"previewImage"}
					objectFit={"cover"}
					draggable={false}
					cursor={"pointer"}
					w={"auto"}
					boxSize={4}
				/>
			);
		else words.push(<>{word}</>);
	}

	const wordArray = line.split(
		/(```[^`]+?```|\*\*[^*]+?\*\*|__[^_]+?__|\*[^*\n]+?\*|~~[^~]+?~~|\|\|[^|\n]+?\|\||`[^`\n]+?`|\s+)/
	);
	for (let i = 0; i < wordArray.length; i++) {
		processWord(wordArray[i], i, i === 0 || wordArray[i - 1].endsWith("\n"));
	}

	return words;
}

export function usePlaceholdersReplaced(text: string, placeholders: Placeholder[]) {
	return useMemo(() => {
		let newText = text;

		placeholders.forEach((placeholder) => {
			newText = newText.replaceAll(placeholder.placeholder, placeholder.replaceWith ?? placeholder.name);
		});

		return newText;
	}, [text, placeholders]);
}

export default function useFormattedDiscordText(text: string, data?: FormatData) {
	const lines = useMemo(() => {
		return text.split("\n");
	}, [text]);

	const mapped = useMemo(() => {
		return lines.map((line, lineIndex) => (
			<>
				<Line key={lineIndex} line={line} data={data} />
				{lineIndex < lines.length - 1 && <br />}
			</>
		));
	}, [lines]);

	return mapped;
}

const Line = memo(function Line({ line, data }: { line: string; data?: FormatData }) {
	const mentionBg = useColorModeValue("hsl(235 85.6% 64.7% / 0.3) !important", "#5057a3df");

	const processedWords = useMemo(() => {
		return processLine(line, mentionBg, data);
	}, [line]);

	const words = useMemo(() => {
		return processedWords.map((word, wordIndex) => (
			<React.Fragment key={"word-" + word + "-" + wordIndex}>{word}</React.Fragment>
		));
	}, [processedWords]);

	return words;
});
