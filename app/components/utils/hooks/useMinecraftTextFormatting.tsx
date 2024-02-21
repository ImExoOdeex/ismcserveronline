import { useToken } from "@chakra-ui/react";
import { useMemo } from "react";
import { parse, toHTML } from "../functions/minecraftText";

export default function useMinecraftTextFormatting(text: string) {
	const [textColor] = useToken("colors", ["text"]);

	const formattedText = useMemo(() => {
		// remove objects with text with onyl spaces or comma
		try {
			const parsed = parse(text).filter((item) => item.text.trim() !== "" && item.text.trim() !== ",");
			if (parsed.length > 0 && parsed[parsed.length - 1].text.endsWith(", ")) {
				parsed[parsed.length - 1].text = parsed[parsed.length - 1].text.slice(0, -2);
			}

			return toHTML(parsed, {
				serializers: {
					gray: {
						styles: {
							color: textColor
						}
					}
				}
			});
		} catch (e) {
			console.error(e);
			return text;
		}
	}, [text]);

	return formattedText;
}
