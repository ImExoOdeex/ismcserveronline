import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import { Flex, HStack, Text, useToast } from "@chakra-ui/react";
import {
	AutoComplete,
	AutoCompleteCreatable,
	AutoCompleteInput,
	AutoCompleteInputProps,
	AutoCompleteItem,
	AutoCompleteList,
	AutoCompleteListProps
} from "@choc-ui/chakra-autocomplete";
import { useState, type Dispatch } from "react";
import { loader } from "~/routes/api.tags";

interface Props {
	input: string;
	setInput: Dispatch<React.SetStateAction<string>>;
	onSubmit?: (value: any, isNew: boolean) => void;
	inputProps?: AutoCompleteInputProps;
	listProps?: AutoCompleteListProps;
}

export default function TagsAutocompleteInput({ input, setInput, onSubmit, inputProps, listProps }: Props) {
	const toast = useToast();
	const [elements, setElements] = useState<string[]>([]);

	const fetcher = useDebouncedFetcherCallback<typeof loader>((data) => {
		if ((data && !Array.isArray(data.tags)) || !data.tags.every((t) => typeof t === "string")) {
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
				debounceTimeout: 200,
				action: "/api/tags"
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [input]);

	return (
		<AutoComplete
			disableFilter
			openOnFocus
			suggestWhenEmpty
			closeOnSelect
			creatable
			onSelectOption={(option: any) => {
				console.log("option", option);

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
				backdropFilter="blur(20px)"
				border="1px solid"
				borderColor={"alpha300"}
				opacity={fetcher.state === "loading" ? 0.5 : 1}
				{...listProps}
			>
				{!input.length && (
					<Flex w="100%" p={1}>
						<Text textAlign={"center"} fontWeight={600} color={"textSec"} w="100%">
							{input.length ? "No tags found" : "Type to search tags"}
						</Text>
					</Flex>
				)}
				{elements.map((element, cid) => (
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
