import useFetcherCallback from "@/hooks/useFetcherCallback";
import TagsAutocompleteInput from "@/layout/routes/server/panel/TagsAutocompleteInput";
import config from "@/utils/config";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogCloseButton,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Flex,
	HStack,
	IconButton,
	Image,
	Stat,
	StatArrow,
	StatHelpText,
	StatLabel,
	StatNumber,
	Tag,
	Text,
	Tooltip,
	useDisclosure
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { action } from "~/routes/api.tags";

export const StatBox = memo(function StatBox({ title, value, helper }: { title: string; value: number; helper?: number }) {
	const percent = useMemo(() => {
		if (helper !== 0 && !helper) return 0;

		if (helper === 0) {
			helper = 1;
		}

		return (value / helper) * 100;
	}, [helper, value]);

	return (
		<Flex p={4} rounded="xl" border="1px solid" borderColor={"alpha300"} flexDir={"column"} w="100%" gap={1}>
			<Stat>
				<StatLabel>{title}</StatLabel>
				<StatNumber>{value}</StatNumber>
				{(helper === 0 || helper) && (
					<Tooltip label={`Percentage shows the increase in this month compared to the last month.`} hasArrow>
						<StatHelpText mb={0} w="fit-content">
							<StatArrow type={percent > 0 ? "increase" : "decrease"} />
							<>{percent.toFixed(0)}%</>
						</StatHelpText>
					</Tooltip>
				)}
			</Stat>
		</Flex>
	);
});

export const TemplateAlertDialog = memo(function TemplateAlertDialog() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = useRef(null);

	return (
		<>
			<IconButton aria-label="Info" icon={<InfoOutlineIcon />} variant={"ghost"} onClick={onOpen} />

			<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} isCentered onClose={onClose} size="xl">
				<AlertDialogOverlay>
					<AlertDialogContent bg="bg">
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Banner Template
							<AlertDialogCloseButton />
						</AlertDialogHeader>

						<AlertDialogBody display={"flex"} flexDir={"column"} gap={4} pb={4}>
							The recommended aspect ratio for the banner is 21:9. Below you can download the template for the
							banner.
							<Image src="/banner-template.png" alt="Banner template" />
							<HStack w="100%">
								<Button as="a" href="/banner-template.png" download w="100%">
									Download PNG
								</Button>
								<Button as="a" href="/banner-template.psd" download w="100%">
									Download PSD
								</Button>
							</HStack>
						</AlertDialogBody>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
});

export const Tags = memo(function Tags({ tags: dbTags, serverId }: { tags: string[]; serverId: number }) {
	const [tags, setTags] = useState<string[]>(dbTags);
	const [optimisticTags, setOptimisticTags] = useState<string[]>(tags);
	const [search, setSearch] = useState<string>("");

	const [submitting, setSubmitting] = useState<string[]>([]);

	const addFetcher = useFetcherCallback<typeof action>((data) => {
		setSubmitting((prev) => (prev = prev.filter((id) => id !== (data as any).tag.name)));
	});

	return (
		<>
			<Flex flexDir="column">
				<Text fontSize={"2xl"} fontWeight={600}>
					Tags{" "}
					<Box as="span" fontSize={"md"} fontWeight={500}>
						{optimisticTags.length}/15
					</Box>
				</Text>
				<Text color={"textSec"}>
					Add tags to your server. Tags are used to help users find your server. Swipe a tag to remove.
				</Text>
			</Flex>

			<Flex gap={2} flexDir={{ base: "column", md: "row" }}>
				<Flex w="100%" gap={4} flexDir={"column"}>
					<Flex w="100%" gap={2}>
						<TagsAutocompleteInput
							input={search}
							setInput={setSearch}
							onSubmit={(tag) => {
								if (tags.includes(tag) || tag.length < 2) return;

								setTags((prev) => [...prev, tag]);
								setOptimisticTags((prev) => [...prev, tag]);
								setSubmitting((prev) => [...prev, tag]);

								addFetcher.submit(
									{
										tag,
										serverId
									},
									{
										action: "/api/tags",
										method: "PUT"
									}
								);
							}}
							inputProps={{
								maxW: "300px",
								placeholder: "Add tag"
							}}
						/>
					</Flex>

					{optimisticTags.length ? (
						<Flex w="100%">
							{tags.map((tag) => (
								<ServerTag
									key={"tag-" + tag}
									tag={tag}
									tags={optimisticTags}
									setTags={setOptimisticTags}
									submitting={submitting}
									serverId={serverId}
								/>
							))}
						</Flex>
					) : (
						<Text color={"textSec"} fontSize={"lg"} fontWeight={600}>
							No tags
						</Text>
					)}
				</Flex>
			</Flex>
		</>
	);
});

export const ServerTag = memo(function ServerTag({
	tag,
	setTags,
	tags,
	serverId,
	submitting
}: {
	tag: string;
	tags: string[];
	serverId: number;
	setTags: React.Dispatch<React.SetStateAction<string[]>>;
	submitting: string[];
}) {
	const [isDragging, setIsDragging] = useState(false);
	const deleteFetcher = useFetcherCallback<typeof action>((data) => {
		console.log("data", data);
	});

	const deleteTag = useCallback(() => {
		(async () => {
			setTags((prev) => prev.filter((t) => t !== tag));

			deleteFetcher.submit(
				{
					tag,
					serverId
				},
				{
					action: "/api/tags",
					method: "DELETE"
				}
			);
		})();
	}, []);

	return (
		<AnimatePresence mode="wait">
			{tags.includes(tag) && (
				<motion.div
					drag="y"
					dragSnapToOrigin
					style={{
						marginRight: "8px",
						overflow: "hidden"
					}}
					transition={{
						ease: config.ease
					}}
					exit={{
						width: 0,
						opacity: 0,
						marginRight: 0
					}}
					onDragEnd={(e, info) => {
						setIsDragging(false);
						if (info.velocity.y > 1000 || info.velocity.y < -1000) {
							deleteTag();
						}
					}}
					onDragStart={() => setIsDragging(true)}
				>
					<Tag
						w="fit-content"
						size={"lg"}
						variant="solid"
						colorScheme={"brand"}
						cursor={isDragging ? "grabbing" : "grab"}
						opacity={submitting.includes(tag) ? 0.5 : 1}
					>
						{tag}
					</Tag>
				</motion.div>
			)}
		</AnimatePresence>
	);
});
