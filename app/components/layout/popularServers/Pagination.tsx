import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
	Flex,
	HStack,
	type FlexProps,
	IconButton,
	Button,
	Editable,
	EditablePreview,
	EditableInput
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import Link from "~/components/utils/Link";
import { useState } from "react";

export default function Pagination({ page, count, ...props }: { page: number; count: number } & FlexProps) {
	const lastPageNo = (count / 10).toFixed(0);
	const navigate = useNavigate();

	const [value, setValue] = useState<string>();

	return (
		<Flex w="100%" {...props}>
			<HStack mx="auto">
				{/* prev page */}
				<Link
					rounded={"xl"}
					to={page == 0 ? "" : page == 2 ? `/popular-servers` : `/popular-servers/${page - 1}`}
				>
					<IconButton
						aria-label="prev page"
						disabled={page == 0}
						icon={<ArrowBackIcon />}
						rounded={"xl"}
						variant={"outline"}
					/>
				</Link>

				<Button rounded={"xl"} variant={"solid"}>
					{page - 1}
				</Button>
				<Button rounded={"xl"} variant={"brand"}>
					{page}
				</Button>
				<Button rounded={"xl"} variant={"solid"}>
					{page + 1}
				</Button>

				<Button rounded={"xl"} variant={"solid"} minW={"60px"}>
					<Editable
						defaultValue="..."
						onSubmit={() => {
							if (/^-?\d+$/.test(value ?? "")) navigate(`/popular-servers/${value}`);
						}}
					>
						<EditablePreview />
						<EditableInput
							onChange={(e) => setValue(e.currentTarget.value)}
							value={value}
							maxW={"fit-content"}
							w="min"
						/>
					</Editable>
				</Button>
				<Button rounded={"xl"} variant={"solid"}>
					{lastPageNo}
				</Button>

				{/* next page */}
				<Link rounded={"xl"} to={`/popular-servers/${page + 1}`}>
					<IconButton aria-label="next page" icon={<ArrowForwardIcon />} rounded={"xl"} variant={"outline"} />
				</Link>
			</HStack>
		</Flex>
	);
}
