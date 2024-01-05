import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
	Button,
	Editable,
	EditableInput,
	EditablePreview,
	Flex,
	HStack,
	IconButton,
	Tooltip,
	type FlexProps
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import Link from "~/components/utils/Link";

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
				<Link rounded={"xl"} to={page === 1 ? "" : page === 2 ? `/popular-servers` : `/popular-servers/${page - 1}`}>
					<Tooltip label={"Previous page"} hasArrow placement="top" openDelay={750}>
						<IconButton
							isDisabled={page === 1}
							aria-label="prev page"
							icon={<ArrowBackIcon />}
							rounded={"xl"}
							variant={"outline"}
						/>
					</Tooltip>
				</Link>

				{page !== 1 && page !== 2 && (
					<Link rounded={"xl"} to={page === 1 || page === 2 ? "" : `/popular-servers`} _hover={{ textDecor: "none" }}>
						<Tooltip label={"First page"} hasArrow placement="top" openDelay={750}>
							<Button rounded={"xl"} variant={"solid"} disabled={page === 1 || page === 2}>
								1
							</Button>
						</Tooltip>
					</Link>
				)}

				{page !== 1 && page !== 2 && page !== 3 && (
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
				)}

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

				{page !== lastPageNo && page !== lastPageNo - 1 && page !== lastPageNo - 2 && (
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
				)}

				{page !== lastPageNo && page !== lastPageNo - 1 && (
					<Link
						rounded={"xl"}
						to={page === lastPageNo || page === lastPageNo - 1 ? "" : `/popular-servers/${lastPageNo}`}
						_hover={{ textDecor: "none" }}
					>
						<Tooltip label={"Last page"} hasArrow placement="top" openDelay={750}>
							<Button rounded={"xl"} variant={"solid"} disabled={page == lastPageNo || page === lastPageNo - 1}>
								{lastPageNo}
							</Button>
						</Tooltip>
					</Link>
				)}

				{/* next page */}
				<Link rounded={"xl"} to={page === lastPageNo ? "" : `/popular-servers/${page + 1}`}>
					<Tooltip label={"Next page"} hasArrow placement="top" openDelay={750}>
						<IconButton
							isDisabled={page === lastPageNo}
							aria-label="next page"
							icon={<ArrowForwardIcon />}
							rounded={"xl"}
							variant={"outline"}
						/>
					</Tooltip>
				</Link>
			</HStack>
		</Flex>
	);
}
