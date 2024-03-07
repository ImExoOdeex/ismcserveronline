import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import { VisuallyHiddenInput, useColorModeValue, useToast } from "@chakra-ui/react";
import {
	AutoComplete,
	AutoCompleteInput,
	AutoCompleteItem,
	AutoCompleteList,
	AutoCompleteTag
} from "@choc-ui/chakra-autocomplete";
import { memo, useState } from "react";
import { loader } from "~/routes/api.tags";

export default memo(function ({ hasAdCredits }: { hasAdCredits: boolean }) {
	const toast = useToast();
	const [elements, setElements] = useState<string[]>([]);

	const fetcher = useDebouncedFetcherCallback<typeof loader>((data) => {
		if ((data && !Array.isArray(data.tags)) || !data.tags.every((t: any) => typeof t === "string")) {
			toast({
				title: "Tags API returned invalid data!",
				status: "error"
			});
			return;
		}
		setElements(data.tags);
	});

	const [input, setInput] = useState("");

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [input]);

	const [tags, setTags] = useState<string[]>([]);

	const boxBg = useColorModeValue("rgba(252, 252, 252, 0.9) !important", "rgba(17, 17, 23, 0.9)");

	return (
		<>
			<VisuallyHiddenInput value={JSON.stringify(tags)} name="tags" />
			<AutoComplete
				disableFilter
				openOnFocus
				multiple
				onChange={(vals: any) => {
					setInput("");
					setTags(vals);
				}}
			>
				<AutoCompleteInput
					isDisabled={!hasAdCredits}
					variant="filled"
					placeholder="Search for tags..."
					value={input}
					onChange={(e: any) => setInput(e.target.value)}
				>
					{tags.map((tag, tid) => (
						<AutoCompleteTag
							key={tid}
							label={tag}
							onRemove={() => {
								setTags((prev) => prev.filter((t) => t !== tag));
							}}
						/>
					))}
				</AutoCompleteInput>
				<AutoCompleteList bg={boxBg}>
					{elements.map((element, cid) => (
						<AutoCompleteItem
							key={`option-${cid}`}
							value={element.toLowerCase()}
							_selected={{ bg: "whiteAlpha.50" }}
							_focus={{ bg: "whiteAlpha.100" }}
						>
							{element.toLowerCase()}
						</AutoCompleteItem>
					))}
				</AutoCompleteList>
			</AutoComplete>
		</>
	);
});
