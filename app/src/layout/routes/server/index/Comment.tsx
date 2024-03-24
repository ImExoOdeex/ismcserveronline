import useFetcherCallback from "@/hooks/useFetcherCallback";
import useUser from "@/hooks/useUser";
import { ChatIcon, EditIcon } from "@chakra-ui/icons";
import { Button, Flex, Icon, IconButton, Image, Text, Textarea, useToast, VisuallyHiddenInput } from "@chakra-ui/react";
import { memo, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { TbMessageReport } from "react-icons/tb";
import ReactTimeAgo from "react-time-ago";
import type { CustomComment } from "./Comments";

export default memo(function Comment({
	comment,
	setComments
}: {
	comment: CustomComment;
	setComments: React.Dispatch<React.SetStateAction<CustomComment[] | null>>;
}) {
	const user = useUser();
	const toast = useToast();

	const isOwner = useMemo(() => {
		return user?.id === comment.user.id;
	}, [user, comment.user.id]);
	const fetcher = useFetcherCallback((data) => {
		const success = data.success;
		toast({
			title: success ? "Your comment has been deleted." : data.error,
			status: success ? "success" : "error"
		});
		if (success) {
			setComments((comments) => (comments ? comments.filter((c) => c.id !== comment.id) : comments));
		}
	});
	const reportFetcher = useFetcherCallback((data) => {
		const success = data.success;
		toast({
			title: success ? "Comment has been reported." : data.error,
			status: success ? "success" : "error"
		});
	});
	const editFetcher = useFetcherCallback((data) => {
		const success = data.success;
		toast({
			title: success ? "Comment has been edited." : data.error,
			status: success ? "success" : "error"
		});
		if (success) {
			setComments((comments) => (comments ? comments.map((c) => (c.id === comment.id ? data.comment : c)) : comments));
		}
		setEditingData((prev) => ({
			...prev,
			isEditing: false
		}));
	});

	const [editingData, setEditingData] = useState({
		isEditing: false,
		content: comment.content
	});

	return (
		<Flex key={comment.id} bg="alpha" rounded={"md"} p={4} flexDir={"column"} gap={2} w="100%">
			<Flex flexDir={"column"} gap={2}>
				<Flex w="100%" justifyContent={"space-between"}>
					<Flex flexDir={"row"} gap={2} alignItems="center">
						<Flex boxSize={10} minW={10}>
							<Image
								src={comment.user.photo ?? "/discordLogo.png"}
								onError={(e) => {
									(e.target as HTMLImageElement).src = "/discordLogo.png";
								}}
								overflow={"hidden"}
								alt={comment.user.nick}
								boxSize="100%"
								rounded={"full"}
							/>
						</Flex>
						<Flex flexDir={"column"}>
							<Flex fontWeight={"semibold"} fontSize={"sm"}>
								{comment.user.nick}
							</Flex>
							<Text fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
								{new Intl.DateTimeFormat("en-US", {
									dateStyle: "medium",
									timeStyle: "short"
								}).format(new Date(comment.created_at))}
								{", "}
								{/* ago */}
								<ReactTimeAgo date={comment.created_at} />
							</Text>
						</Flex>
					</Flex>

					<Flex gap={1}>
						<reportFetcher.Form method="POST">
							<VisuallyHiddenInput name="id" value={comment.id} readOnly />
							<IconButton
								aria-label={"Report comment"}
								icon={<Icon as={TbMessageReport} boxSize={"18px"} />}
								fontWeight={"semibold"}
								type="submit"
								color={"yellow.500"}
								_hover={{ color: "yellow.600", bg: "rgba(255, 217, 0, 0.05)" }}
								_active={{ color: "yellow.700", bg: "rgba(255, 217, 0, 0.1)" }}
								bg="transparent"
								isLoading={reportFetcher.state !== "idle"}
								name="action"
								value="report"
							/>
						</reportFetcher.Form>
						{isOwner && (
							<>
								<fetcher.Form method="delete">
									<VisuallyHiddenInput name="id" value={comment.id} readOnly />
									<IconButton
										aria-label={"Delete comment"}
										icon={<FiTrash2 />}
										fontWeight={"semibold"}
										type="submit"
										color={"red.500"}
										_hover={{ color: "red.600", bg: "rgba(255, 0, 0, 0.05)" }}
										_active={{ color: "red.700", bg: "rgba(255, 0, 0, 0.1)" }}
										bg="transparent"
										isLoading={fetcher.state !== "idle"}
										name="action"
										value="delete"
									/>
								</fetcher.Form>
								<IconButton
									aria-label={"Edit comment"}
									icon={<EditIcon />}
									fontWeight={"semibold"}
									type="submit"
									bg="transparent"
									onClick={() => {
										setEditingData((prev) => ({
											...prev,
											isEditing: !prev.isEditing
										}));
									}}
									_hover={{
										bg: "alpha"
									}}
									_active={{
										bg: "alpha100"
									}}
								/>
							</>
						)}
					</Flex>
				</Flex>
				<Flex fontSize={"sm"} mt={2}>
					{editingData.isEditing ? (
						<editFetcher.Form
							method="POST"
							style={{
								width: "100%"
							}}
						>
							<Flex flexDir={"column"} w="100%" gap={2}>
								<VisuallyHiddenInput name="id" value={comment.id} readOnly />
								<Textarea
									value={editingData.content}
									onChange={(e) =>
										setEditingData((prev) => ({
											...prev,
											content: e.target.value
										}))
									}
									name="content"
									placeholder="Write your comment here"
									variant="filled"
									bg="alpha"
								/>
								<Flex justifyContent={"flex-end"}>
									<Button
										rightIcon={<ChatIcon />}
										variant="brand"
										type="submit"
										isLoading={editFetcher.state !== "idle"}
										isDisabled={editingData.content.length === 0}
										name="action"
										value="edit"
									>
										Submit
									</Button>
								</Flex>
							</Flex>
						</editFetcher.Form>
					) : (
						<Text as="pre" fontFamily={"body"} whiteSpace={"pre-wrap"}>
							{comment.content}
						</Text>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
});
