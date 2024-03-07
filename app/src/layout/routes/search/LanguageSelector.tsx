import languages from "@/utils/languages";
import { HStack, Image, InputGroup, InputLeftElement, Text, useColorModeValue } from "@chakra-ui/react";
import { AutoComplete, AutoCompleteInput, AutoCompleteItem, AutoCompleteList } from "@choc-ui/chakra-autocomplete";
import { useSearchParams } from "@remix-run/react";
import { memo, useMemo, useRef, useState } from "react";

interface Props {
	locale: string;
}

export default memo(function LanguageSelector({ locale }: Props) {
	locale = locale === "en" ? "us" : locale;

	const [, setSearchParams] = useSearchParams();

	const [code, setCode] = useState(locale);
	const [input, setInput] = useState(
		languages.find((lang) => lang.countryCode.toLowerCase() === locale.toLowerCase())?.name ?? "English"
	);

	const languagesOptions = useMemo(() => {
		return languages
			.map((lang) => {
				return {
					label: lang.name,
					value: lang.countryCode.toLowerCase(),
					icon: `https://flagcdn.com/${lang.countryCode.toLowerCase()}.svg`
				};
			})
			.filter((lang) => lang.label.toLowerCase().includes(input.toLowerCase()));
	}, [input]);

	const inputRef = useRef<HTMLInputElement>(null);
	const boxBg = useColorModeValue("rgba(252, 252, 252, 0.9) !important", "rgba(17, 17, 23, 0.9)");

	return (
		<>
			<AutoComplete
				disableFilter
				openOnFocus
				suggestWhenEmpty
				closeOnSelect
				onSelectOption={(option: any) => {
					setInput(option.item.label);
					setCode(option.item.value);
					inputRef.current?.blur();

					document.cookie = `locale=${option.item.value}`;

					setSearchParams((prev) => {
						if (option.item.value === "en") {
							prev.delete("lang");
						} else {
							prev.set("lang", option.item.value);
						}

						return prev;
					});
				}}
			>
				<InputGroup>
					<InputLeftElement>
						<Image src={`https://flagcdn.com/${code}.svg`} h={4} rounded={"sm"} />
					</InputLeftElement>
					<AutoCompleteInput
						ref={inputRef}
						value={input}
						onChange={(e: any) => setInput(e.target.value)}
						autoComplete="off"
						bg="alpha"
						variant={"filled"}
						_hover={{ bg: "alpha100" }}
						onFocus={(e: any) => {
							e.target.select();
						}}
					/>
				</InputGroup>
				<AutoCompleteList p={1.5} bg={boxBg} border="1px solid" borderColor={"alpha300"}>
					{languagesOptions.map((element, cid) => (
						<AutoCompleteItem key={`option-${cid}`} mx={0} value={element.value} label={element.label}>
							<HStack>
								<Image src={element.icon} h={5} rounded={"sm"} />
								<Text>{element.label}</Text>
							</HStack>
						</AutoCompleteItem>
					))}
				</AutoCompleteList>
			</AutoComplete>
		</>
	);
});
