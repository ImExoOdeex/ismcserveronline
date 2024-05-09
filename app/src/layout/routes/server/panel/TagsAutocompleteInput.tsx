import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import { useProgressBarContext } from "@/layout/global/ProgressBarContext";
import { Flex, HStack, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import type { AutoCompleteInputProps, AutoCompleteListProps } from "@choc-ui/chakra-autocomplete";
import {
    AutoComplete,
    AutoCompleteCreatable,
    AutoCompleteInput,
    AutoCompleteItem,
    AutoCompleteList
} from "@choc-ui/chakra-autocomplete";
import { useState, type Dispatch } from "react";
import type { loader } from "~/routes/api.tags";

interface Props {
    input: string;
    setInput: Dispatch<React.SetStateAction<string>>;
    onSubmit?: (value: any, isNew: boolean) => void;
    inputProps?: AutoCompleteInputProps;
    listProps?: AutoCompleteListProps;
}

export default function TagsAutocompleteInput({
    input,
    setInput,
    onSubmit,
    inputProps,
    listProps
}: Props) {
    const toast = useToast();
    const [elements, setElements] = useState<string[]>([]);

    const fetcher = useDebouncedFetcherCallback<typeof loader>((data) => {
        if (
            (data && !Array.isArray(data.tags)) ||
            !data.tags.every((t: any) => typeof t === "string")
        ) {
            toast({
                title: "Tags API returned invalid data!",
                status: "error"
            });
            return;
        }
        setElements(data.tags);
    });

    useInsideEffect(() => {
        if (input.length < 1) {
            setElements([]);
            return;
        }
        fetcher.submit(
            {
                search: input
            },
            {
                debounceTimeout: 100,
                action: "/api/tags"
            }
        );
    }, [input]);

    const boxBg = useColorModeValue("rgba(252, 252, 252, 0.9) !important", "rgba(17, 17, 23, 0.9)");

    const { start } = useProgressBarContext();

    return (
        <AutoComplete
            disableFilter
            openOnFocus
            suggestWhenEmpty
            closeOnSelect
            creatable
            onSelectOption={(option: any) => {
                start();

                onSubmit?.(option.item.value, option.item.creatable);
                setInput("");
            }}
        >
            <AutoCompleteInput
                value={input}
                onChange={(e: any) => setInput(e.target.value)}
                autoComplete="off"
                bg="alpha"
                variant={"filled"}
                _hover={{ bg: "alpha100" }}
                inputProps={inputProps}
                {...inputProps}
            />
            <AutoCompleteList
                p={1.5}
                bg="transparent !important"
                border="1px solid"
                borderColor={"alpha300"}
                opacity={fetcher.state === "loading" ? 0.5 : 1}
                {...listProps}
            >
                <Flex
                    pos={"absolute"}
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg={boxBg}
                    zIndex={-1}
                />
                {!input.length && (
                    <Flex w="100%" p={1}>
                        <Text textAlign={"center"} fontWeight={600} color={"textSec"} w="100%">
                            {input.length ? "No tags found" : "Type to search tags"}
                        </Text>
                    </Flex>
                )}
                {!!input.length &&
                    elements.map((element, cid) => (
                        <AutoCompleteItem key={`option-${cid}`} mx={0} value={element}>
                            <HStack>
                                <Text>{element}</Text>
                            </HStack>
                        </AutoCompleteItem>
                    ))}

                {!elements.includes(input) && <AutoCompleteCreatable mx={0} />}
            </AutoCompleteList>
        </AutoComplete>
    );
}
