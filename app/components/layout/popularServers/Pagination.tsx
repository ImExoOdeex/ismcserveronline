import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
	Flex,
	HStack,
	type FlexProps,
	IconButton,
	Button,
	Editable,
	EditablePreview,
	EditableInput,
	Tooltip
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import Link from "~/components/utils/Link";
import { useState } from "react";

export default function Pagination({ page, count, ...props }: { page: number; count: number } & FlexProps) {
	const lastPageNo = Number((count / 10).toFixed(0));
	const navigate = useNavigate();

	const [value, setValue] = useState<string>();

	return (
		<Flex w="100%" {...props}>
			<HStack
				mx="auto"
				spacing={{ base: "auto", sm: 2 }}
				justifyContent={{ base: "space-around", sm: "unset" }}
				w={{ base: "100%", sm: "unset" }}
			>
				{/* prev page */}
				<Tooltip label={"Previous page"}>
					<Link rounded={"xl"} to={page === 1 ? "" : page === 2 ? `/popular-servers` : `/popular-servers/${page - 1}`}>
						<IconButton
							aria-label="prev page"
							disabled={page === 1}
							icon={<ArrowBackIcon />}
							rounded={"xl"}
							variant={"outline"}
						/>
					</Link>
				</Tooltip>

				<Link rounded={"xl"} to={page === 1 || page === 2 ? "" : `/popular-servers`} _hover={{ textDecor: "none" }}>
					<Button rounded={"xl"} variant={"solid"} disabled={page === 1 || page === 2}>
						1
					</Button>
				</Link>

				<Button
					rounded={"xl"}
					variant={"solid"}
					minW={"60px"}
					disabled={page === 1 || page === 2 || page === 3}
					display={{ base: "none", sm: "flex" }}
				>
					<Editable
						isDisabled={page === 1 || page === 2 || page === 3}
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

				{page === lastPageNo && (
					<Link rounded={"xl"} to={`/popular-servers/${page - 2}`} _hover={{ textDecor: "none" }}>
						<Button rounded={"xl"} variant={"solid"}>
							{page - 2}
						</Button>
					</Link>
				)}

				{page !== 1 && (
					<Link rounded={"xl"} to={`/popular-servers/${page - 1}`} _hover={{ textDecor: "none" }}>
						<Button rounded={"xl"} variant={"solid"}>
							{page - 1}
						</Button>
					</Link>
				)}

				<Link rounded={"xl"} to={`/popular-servers/${page}`} _hover={{ textDecor: "none" }}>
					<Button rounded={"xl"} variant={"brand"}>
						{page}
					</Button>
				</Link>

				{page !== lastPageNo && (
					<Link
						rounded={"xl"}
						to={page === lastPageNo ? "" : `/popular-servers/${page + 1}`}
						_hover={{ textDecor: "none" }}
					>
						<Button rounded={"xl"} variant={"solid"}>
							{page + 1}
						</Button>
					</Link>
				)}

				{page === 1 && (
					<Link rounded={"xl"} to={`/popular-servers/${page + 2}`} _hover={{ textDecor: "none" }}>
						<Button rounded={"xl"} variant={"solid"}>
							{page + 2}
						</Button>
					</Link>
				)}

				<Button
					rounded={"xl"}
					variant={"solid"}
					minW={"60px"}
					display={{ base: "none", sm: "flex" }}
					disabled={page === lastPageNo || page === lastPageNo - 1 || page === lastPageNo - 2}
				>
					<Editable
						isDisabled={page === lastPageNo || page === lastPageNo - 1 || page === lastPageNo - 2}
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

				<Link
					rounded={"xl"}
					to={page === lastPageNo || page === lastPageNo - 1 ? "" : `/popular-servers/256`}
					_hover={{ textDecor: "none" }}
				>
					<Button rounded={"xl"} variant={"solid"} disabled={page == lastPageNo || page === lastPageNo - 1}>
						{lastPageNo}
					</Button>
				</Link>

				{/* next page */}
				<Link rounded={"xl"} to={page === lastPageNo ? "" : `/popular-servers/${page + 1}`}>
					<IconButton
						aria-label="next page"
						icon={<ArrowForwardIcon />}
						rounded={"xl"}
						disabled={page === lastPageNo}
						variant={"outline"}
					/>
				</Link>
			</HStack>
		</Flex>
	);
}
