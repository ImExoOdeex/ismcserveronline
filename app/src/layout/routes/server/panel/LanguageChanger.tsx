import useFetcherCallback from "@/hooks/useFetcherCallback";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import languages from "@/utils/languages";
import {
    HStack,
    Image,
    InputGroup,
    InputLeftElement,
    Text,
    useColorModeValue,
    useToast
} from "@chakra-ui/react";
import {
    AutoComplete,
    AutoCompleteInput,
    AutoCompleteItem,
    AutoCompleteList
} from "@choc-ui/chakra-autocomplete";
import { memo, useMemo, useRef, useState } from "react";

interface Props {
    locale: string | null;
}

export default memo(function LanguageChanger({ locale }: Props) {
    locale = locale === "en" ? "us" : locale;

    const [code, setCode] = useState(locale);
    const [input, setInput] = useState(
        languages.find((lang) => lang.countryCode.toLowerCase() === locale?.toLowerCase())?.name
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
            .filter((lang) => lang.label.toLowerCase().includes(input ? input.toLowerCase() : ""));
    }, [input]);

    const inputRef = useRef<HTMLInputElement>(null);
    const boxBg = useColorModeValue("rgba(252, 252, 252, 0.9) !important", "rgba(17, 17, 23, 0.9)");

    const { start, done } = useProgressBarContext();
    const toast = useToast();

    const fetcher = useFetcherCallback((data) => {
        if (!data.success) {
            toast({
                title: data?.message || "An error occurred while changing the language.",
                status: "error"
            });
        }
        done();
    });

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

                    fetcher.submit(
                        {
                            intent: "language",
                            language: option.item.value
                        },
                        {
                            method: "PATCH"
                        }
                    );

                    start();
                }}
            >
                <InputGroup>
                    {code && (
                        <InputLeftElement>
                            <Image src={`https://flagcdn.com/${code}.svg`} h={4} rounded={"sm"} />
                        </InputLeftElement>
                    )}
                    <AutoCompleteInput
                        placeholder="Search for a language"
                        maxW="300px"
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
                        <AutoCompleteItem
                            key={`option-${cid}`}
                            mx={0}
                            value={element.value}
                            label={element.label}
                        >
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
