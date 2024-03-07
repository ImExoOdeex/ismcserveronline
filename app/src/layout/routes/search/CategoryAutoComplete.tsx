import useDebouncedFetcherCallback from "@/hooks/useDebouncedFetcherCallback";
import useInsideEffect from "@/hooks/useInsideEffect";
import { useColorModeValue, useToast } from "@chakra-ui/react";
import {
	AutoComplete,
	AutoCompleteInput,
	AutoCompleteItem,
	AutoCompleteList,
	AutoCompleteTag
} from "@choc-ui/chakra-autocomplete";
import { useSearchParams } from "@remix-run/react";
import { memo, useState } from "react";
import { loader } from "~/routes/api.tags";

export default memo(function CategoryAutoComplete() {
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

	const [searchParams, setSearchParams] = useSearchParams();
	const tags = searchParams.getAll("tag");

	const boxBg = useColorModeValue("rgba(252, 252, 252, 0.9) !important", "rgba(17, 17, 23, 0.9)");

	return (
		<>
			<AutoComplete
				disableFilter
				openOnFocus
				multiple
				onChange={(vals: any) => {
					setInput("");
					setSearchParams((prev) => {
						prev.getAll("tag").forEach((val: string) => prev.delete("tag", val));
						vals.forEach((val: string) => prev.append("tag", val));
						return prev;
					});
				}}
			>
				<AutoCompleteInput
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
								setSearchParams((prev) => {
									prev.delete("tag", tag);
									return prev;
								});
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
