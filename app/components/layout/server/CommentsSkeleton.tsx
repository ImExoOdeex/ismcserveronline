import { Flex, FlexProps, VStack, keyframes, useToken } from "@chakra-ui/react";
import { memo, useEffect, useMemo } from "react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { action } from "~/routes/api.comments";

interface Props {
	comments: CustomComment[] | null;
	setComments: React.Dispatch<React.SetStateAction<CustomComment[] | null>>;
	serverId: number;
}

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

function getRandomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export default memo(function CommentsSkeleton({ comments, setComments, serverId }: Props) {
	const skeletonComments = useMemo(() => {
		const arr = [];
		for (let i = 0; i < 5; i++) {
			arr.push({
				id: i,
				usernameWidth: getRandomBetween(20, 35),
				contentWidth: getRandomBetween(30, 100)
			});
		}
		return arr;
	}, []);

	useEffect(() => {
		(async () => {
			if (comments) return console.info("Comments already fetched");
			const res = await fetch("/api/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({ serverId: serverId.toString() })
			}).then((res) => {
				if (!res.ok) throw new Error("Error fetching comments");
				return res.json() as Promise<UseDataFunctionReturn<typeof action>>;
			});

			setComments(res.comments);
		})();
	}, []);

	return (
		<VStack w="100%" alignItems={"flex-start"}>
			{skeletonComments.map((c, i) => (
				<>
					<Skeleton key={"skeleton-" + i} w="100%" h={"111px"} rounded={"md"} p={4} flexDir={"column"} gap={2}>
						<Flex flexDir={"row"} gap={2} alignItems="center" w="100%">
							<Skeleton startColor="transparent" endColor="alpha200" rounded={"full"} boxSize="10" />
							<Skeleton
								h={1.5}
								rounded={"md"}
								w={c.usernameWidth + "%"}
								startColor="transparent"
								endColor="alpha200"
							/>
						</Flex>

						<Flex flex={1} alignItems={"center"} justifyContent={"flex-start"}>
							<Skeleton
								w={c.contentWidth + "%"}
								h={1.5}
								rounded={"md"}
								startColor="transparent"
								endColor="alpha200"
							/>
						</Flex>
					</Skeleton>
				</>
			))}
		</VStack>
	);
});

interface CustomSkeletonProps {
	startColor?: string;
	endColor?: string;
	speed?: number;
}

function Skeleton({ startColor = "alpha200", endColor = "transparent", speed = 0.8, ...props }: CustomSkeletonProps & FlexProps) {
	[startColor, endColor] = useToken("colors", [startColor, endColor]);

	const bgFade = keyframes({
		from: {
			borderColor: startColor,
			background: startColor
		},
		to: {
			borderColor: endColor,
			background: endColor
		}
	});

	return <Flex animation={`${speed}s linear infinite alternate ${bgFade}`} {...props} />;
}
