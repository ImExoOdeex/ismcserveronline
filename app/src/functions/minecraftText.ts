// credits: https://github.com/PassTheMayo/minecraft-motd-util/blob/main/src/toHTML.ts
// copied, cause i wanted to edit it & package is no longer maintained

interface ParseItem {
	color: string;
	bold?: boolean;
	italics?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	obfuscated?: boolean;
	text: string;
}

type ParseResult = ParseItem[];

type FormattingProperties = "bold" | "italics" | "underline" | "strikethrough" | "obfuscated";

interface SerializerElementOption {
	classes?: string[];
	styles?: Record<string, string>;
}

interface HTMLOptions {
	serializers?: Record<string | FormattingProperties, SerializerElementOption>;
	rootTag?: string;
}

interface Chat {
	text: string;
	translate?: string;
	color?: string;
	bold?: string;
	italic?: string;
	underlined?: string;
	strikethrough?: string;
	obfuscated?: string;
	extra?: Chat[];
}

interface ParseOptions {
	formattingCharacter?: string;
}

const defaultSerializers = {
	black: { styles: { color: "#000000" } },
	dark_blue: { styles: { color: "#0000AA" } },
	dark_green: { styles: { color: "#00AA00" } },
	dark_aqua: { styles: { color: "#00AAAA" } },
	dark_red: { styles: { color: "#AA0000" } },
	dark_purple: { styles: { color: "#AA00AA" } },
	gold: { styles: { color: "#FFAA00" } },
	gray: { styles: { color: "#AAAAAA" } },
	dark_gray: { styles: { color: "#555555" } },
	blue: { styles: { color: "#5555FF" } },
	green: { styles: { color: "#55FF55" } },
	aqua: { styles: { color: "#55FFFF" } },
	red: { styles: { color: "#FF5555" } },
	light_purple: { styles: { color: "#FF55FF" } },
	yellow: { styles: { color: "#FFFF55" } },
	white: { styles: { color: "#FFFFFF" } },
	minecoin_gold: { styles: { color: "#DDD605" } },
	obfuscated: { classes: ["minecraft-formatting-obfuscated"] },
	bold: { styles: { "font-weight": "bold" } },
	strikethrough: { styles: { "text-decoration": "line-through" } },
	underline: { styles: { "text-decoration": "underline" } },
	italics: { styles: { "font-style": "italic" } }
} satisfies Record<string, SerializerElementOption>;

export function toHTML(tree: ParseResult, options?: HTMLOptions): string {
	if (!Array.isArray(tree)) {
		throw new Error(`Expected 'tree' to be typeof 'array', received '${typeof tree}'`);
	}

	const opts = Object.assign(
		{
			serializers: defaultSerializers,
			rootTag: "span"
		},
		options
	);

	let result = `<${opts.rootTag}>`;

	for (const item of tree) {
		const classes = [];
		const styles: Record<string, string[]> = {};

		for (const prop in item) {
			if (prop === "text") continue;

			const serializer = opts.serializers[prop === "color" ? item[prop] : prop];

			if (serializer) {
				if (serializer.classes && serializer.classes.length > 0) {
					classes.push(...serializer.classes);
				}

				if (serializer.styles) {
					for (const attr in serializer.styles) {
						if (!(attr in styles)) {
							styles[attr] = [];
						}

						styles[attr].push(serializer.styles[attr]);
					}
				}
			} else if (prop === "color") {
				if (!("color" in styles)) {
					styles.color = [];
				}

				styles.color.push(item[prop]);
			}
		}

		const content = item.text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");

		result += `<span${classes.length > 0 ? ` class="${classes.join(" ")}"` : ""}${
			Object.keys(styles).length > 0
				? ` style="${Object.entries(styles)
						.map((style) => `${style[0]}: ${style[1].join(" ")};`)
						.join(" ")}"`
				: ""
		}>${content}</span>`;
	}

	result += `</${opts.rootTag}>`;

	return result;
}

const colorLookupNames = {
	"0": "black",
	"1": "dark_blue",
	"2": "dark_green",
	"3": "dark_aqua",
	"4": "dark_red",
	"5": "dark_purple",
	"6": "gold",
	"7": "gray",
	"8": "dark_gray",
	"9": "blue",
	a: "green",
	b: "aqua",
	c: "red",
	d: "light_purple",
	e: "yellow",
	f: "white",
	g: "minecoin_gold"
} satisfies Record<string, string> as Record<string, string>;

const formattingLookupProperties = {
	k: "obfuscated",
	l: "bold",
	m: "strikethrough",
	n: "underline",
	o: "italics"
} satisfies Record<string, FormattingProperties> as Record<string, FormattingProperties>;

function parseBool(value?: string | boolean): boolean {
	return typeof value === "boolean" ? value : typeof value === "string" ? value.toLowerCase() === "true" : false;
}

function parseText(text: string, options: ParseOptions): ParseResult {
	const result: ParseItem[] = [{ text: "", color: "gray" }];

	let position = 0;

	while (position + 1 <= text.length) {
		const character = text.charAt(position);

		let item: ParseItem = result[result.length - 1];

		if (character === "\n") {
			result.push({ text: "\n", color: "gray" });

			position++;

			continue;
		}

		if (character !== options.formattingCharacter) {
			item.text += character;

			position++;

			continue;
		}

		const formattingCode = text.charAt(position + 1).toLowerCase();

		position += 2;

		if (formattingCode === "r") {
			result.push({ text: "", color: "gray" });

			continue;
		}

		if (formattingCode in formattingLookupProperties) {
			if (item.text.length > 0) {
				result.push({ ...item, text: "", [formattingLookupProperties[formattingCode]]: true });
			} else {
				item[formattingLookupProperties[formattingCode]] = true;
			}
		} else if (formattingCode in colorLookupNames) {
			result.push({ text: "", color: colorLookupNames[formattingCode] });
		}
	}

	return result;
}

function parseChat(chat: Chat, options: ParseOptions, parent?: Chat): ParseResult {
	const result: ParseResult = parseText(chat.text || chat.translate || "", options);
	const item: ParseItem = result[0];

	if ((parent && parseBool(parent.bold) && !parseBool(chat.bold)) || parseBool(chat.bold)) {
		item.bold = true;
	}

	if ((parent && parseBool(parent.italic) && !parseBool(chat.italic)) || parseBool(chat.italic)) {
		item.italics = true;
	}

	if ((parent && parseBool(parent.underlined) && !parseBool(chat.underlined)) || parseBool(chat.underlined)) {
		item.underline = true;
	}

	if ((parent && parseBool(parent.strikethrough) && !parseBool(chat.strikethrough)) || parseBool(chat.strikethrough)) {
		item.strikethrough = true;
	}

	if ((parent && parseBool(parent.obfuscated) && !parseBool(chat.obfuscated)) || parseBool(chat.obfuscated)) {
		item.obfuscated = true;
	}

	if (chat.color) {
		item.color = colorLookupNames[chat.color] || chat.color;
	} else if (parent?.color) {
		item.color = colorLookupNames[parent.color] || parent.color;
	}

	chat.bold = item.bold ? "true" : "false";
	chat.italic = item.italics ? "true" : "false";
	chat.underlined = item.underline ? "true" : "false";
	chat.strikethrough = item.strikethrough ? "true" : "false";
	chat.obfuscated = item.obfuscated ? "true" : "false";
	chat.color = item.color;

	if (chat.extra) {
		for (const extra of chat.extra) {
			result.push(...parseChat(extra, options, chat));
		}
	}

	return result;
}

export function parse(input: Chat | string, options?: ParseOptions): ParseResult {
	options = Object.assign(
		{
			formattingCharacter: "\u00A7"
		},
		options
	);

	let result;

	switch (typeof input) {
		case "string": {
			result = parseText(input, options);

			break;
		}
		case "object": {
			result = parseChat(input, options);

			break;
		}
		default: {
			throw new Error("Unexpected server MOTD type: " + typeof input);
		}
	}

	return result.filter((item) => item.text.length > 0);
}
