import { ChatIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, AlertTitle, Button, Flex, HStack, Image, Text, Textarea, useToast, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { useEffect, useState } from "react";
import useUser from "~/components/utils/hooks/useUser";
import Comment from "./Comment";

type Props = {
	comments: CustomComment[];
	setComments: React.Dispatch<React.SetStateAction<CustomComment[]>>;
};

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

export default function Comments({ comments, setComments }: Props) {
	const user = useUser();

	const fetcher = useFetcher();

	const [newComment, setNewComment] = useState("");

	const toast = useToast();
	useEffect(() => {
		if ((fetcher.data as any)?.success) {
			setComments((comments) => [(fetcher.data as any).comment, ...comments]);
			setNewComment("");
			toast({
				title: "Comment added.",
				status: "success",
				duration: 9000,
				position: "bottom-right",
				variant: "subtle",
				isClosable: true
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	const hasCommented = comments.some((comment) => comment.user.nick === user?.nick);

	return (
		<Flex flexDir={"column"} gap={user !== null && !hasCommented ? 10 : 4} w="100%">
			{/* create comment component */}
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
									{(fetcher.data as any)?.error && (
										<Text as="span" fontWeight={600} color="red">
											{" "}
											{(fetcher.data as any).error}
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
				{comments.map((comment) => (
					<Comment key={comment.id} comment={comment} setComments={setComments} />
				))}
			</VStack>
		</Flex>
	);
}