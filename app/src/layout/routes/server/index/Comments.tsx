import useUser from "@/hooks/useUser";
import { ChatIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, AlertTitle, Button, Flex, HStack, Image, Text, Textarea, useToast, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { memo, useEffect, useMemo, useState } from "react";
import type { action } from "~/routes/$server";
import Comment from "./Comment";

interface Props {
	comments: CustomComment[] | null;
	freshComments: CustomComment[];
	setComments: React.Dispatch<React.SetStateAction<CustomComment[] | null>>;
}

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

export interface CustomComment {
	id: number;
	content: string;
	created_at: Date;
	updated_at: Date;
	user: {
		nick: string;
		photo: string | null;
		id: number;
	};
}

export default memo(function Comments({ comments, freshComments, setComments }: Props) {
	const user = useUser();

	const fetcher = useFetcher<typeof action>();

	const [newComment, setNewComment] = useState("");

	const toast = useToast();
	useEffect(() => {
		if (fetcher.data?.success) {
			setComments((comments) => (comments ? [fetcher.data.comment, ...comments] : comments));
			setNewComment("");
			toast({
				title: "Comment has been added.",
				status: "success"
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	const hasCommented = useMemo(() => {
		return (comments || freshComments).some((comment) => comment.user.nick === user?.nick);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comments, user?.nick]);

	useEffect(() => {
		setComments(freshComments);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Flex flexDir={"column"} gap={user !== null && !hasCommented ? 10 : 4} w="100%">
			{user !== null ? (
				<>
					{hasCommented ? (
						<Alert status="success" borderRadius={"md"} w="100%">
							<AlertIcon />
							<AlertTitle mr={2}>You have already commented on this server.</AlertTitle>
						</Alert>
					) : (
						<fetcher.Form
							method="POST"
							style={{
								width: "100%"
							}}
						>
							<Flex flexDir={"column"} gap={2} w="100%">
								<Text>
									Write a comment
									{fetcher.data?.error && (
										<Text as="span" fontWeight={600} color="red">
											{" "}
											{fetcher.data?.error}
										</Text>
									)}
								</Text>

								<Textarea
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									placeholder="Write your comment here"
									variant="filled"
									w="100%"
									bg="alpha"
									name="content"
								/>

								<Flex justifyContent={"space-between"} w="100%" alignItems={"center"}>
									<HStack spacing={3}>
										<Image
											src={user.photo ?? "/default.png"}
											alt={user.nick}
											boxSize={10}
											borderRadius={"full"}
										/>
										<Flex flexDir={"column"}>
											<Text fontSize={"xs"}>Writing as</Text>
											<Text fontWeight={600}>{user.nick}</Text>
										</Flex>
									</HStack>
									<Button
										rightIcon={<ChatIcon />}
										variant="brand"
										type="submit"
										isLoading={fetcher.state !== "idle"}
										isDisabled={newComment.length === 0}
										name="action"
										value="comment"
									>
										Submit
									</Button>
								</Flex>
							</Flex>
						</fetcher.Form>
					)}
				</>
			) : (
				<Alert status="error" borderRadius={"md"} w="100%">
					<AlertIcon />
					<AlertTitle mr={2}>You must be logged in to comment.</AlertTitle>
				</Alert>
			)}

			<VStack w="100%" alignItems={"flex-start"}>
				{(comments || freshComments).map((comment) => (
					<Comment key={comment.id} comment={comment} setComments={setComments} />
				))}
			</VStack>
		</Flex>
	);
});
