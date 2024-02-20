import { ChatIcon, EditIcon } from "@chakra-ui/icons";
import { Button, Flex, Icon, IconButton, Image, Text, Textarea, VisuallyHiddenInput, useToast } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { TbMessageReport } from "react-icons/tb";
import ReactTimeAgo from "react-time-ago";
import useRootData from "~/components/utils/hooks/useRootData";
import type { CustomComment } from "./Comments";

export default function Comment({
	comment,
	setComments
}: {
	comment: CustomComment;
	setComments: React.Dispatch<React.SetStateAction<CustomComment[]>>;
}) {
	const { user } = useRootData();

	const isOwner = user?.id === comment.user.id;
	const fetcher = useFetcher();
	const reportFetcher = useFetcher();
	const editFetcher = useFetcher();

	const toast = useToast();
	useEffect(() => {
		if (fetcher.data) {
			const success = (fetcher.data as any).success;
			toast({
				title: success ? "Your comment has been deleted." : (fetcher.data as any).error,
				status: success ? "success" : "error",
				duration: 9000,
				position: "bottom-right",
				variant: "subtle",
				isClosable: true
			});
			if (success) {
				setComments((comments) => comments.filter((c) => c.id !== comment.id));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);
	useEffect(() => {
		if (reportFetcher.data) {
			const success = (reportFetcher.data as any).success;
			toast({
				title: success ? "Comment has been reported." : (reportFetcher.data as any).error,
				status: success ? "success" : "error",
				duration: 9000,
				position: "bottom-right",
				variant: "subtle",
				isClosable: true
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reportFetcher.data]);
	useEffect(() => {
		if (editFetcher.data) {
			const success = (editFetcher.data as any).success;
			toast({
				title: success ? "Comment has been edited." : (editFetcher.data as any).error,
				status: success ? "success" : "error",
				duration: 9000,
				position: "bottom-right",
				variant: "subtle",
				isClosable: true
			});
			if (success) {
				setComments((comments) => comments.map((c) => (c.id === comment.id ? (editFetcher.data as any).comment : c)));
			}
			setEditingData((prev) => ({
				...prev,
				isEditing: false
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editFetcher.data]);

	const [editingData, setEditingData] = useState({
		isEditing: false,
		content: comment.content
	});

	return (
		<Flex key={comment.id} bg="alpha" borderRadius={"md"} p={4} flexDir={"column"} gap={2} w="100%">
			<Flex flexDir={"column"} gap={2}>
				<Flex w="100%" justifyContent={"space-between"}>
					<Flex flexDir={"row"} gap={2} alignItems="center">
						<Flex boxSize={10}>
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
							<Text fontSize={"sm"}>
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
							<VisuallyHiddenInput name="id" value={comment.id} />
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
									<VisuallyHiddenInput name="id" value={comment.id} />
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
								<VisuallyHiddenInput name="id" value={comment.id} />
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
						<Text as="pre" fontFamily={"body"}>
							{comment.content}
						</Text>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}
