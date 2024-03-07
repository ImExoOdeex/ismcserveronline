import { HStack, IconButton, Input } from "@chakra-ui/react";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { memo, useState } from "react";
import { BiSearch } from "react-icons/bi";

export default memo(function SearchForm() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [search, setSearch] = useState(searchParams.get("q") ?? "");
	const searchFetcher = useFetcher();

	return (
		<>
			<HStack
				w="100%"
				as={searchFetcher.Form}
				method="GET"
				onSubmit={(e) => {
					e.preventDefault();
					setSearchParams((prev) => {
						if (search) {
							prev.set("q", search);
						} else {
							prev.delete("q");
						}
						return prev;
					});
				}}
			>
				<Input
					size={"lg"}
					placeholder={"Search by tags, name etc."}
					variant={"filled"}
					rounded={"xl"}
					name="q"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<IconButton
					type="submit"
					aria-label="Search"
					icon={<BiSearch />}
					size={"lg"}
					variant={"brand"}
					isLoading={searchFetcher.state !== "idle"}
				/>
			</HStack>
		</>
	);
});
