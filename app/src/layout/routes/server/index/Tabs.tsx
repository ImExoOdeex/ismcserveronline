import useFetcherCallback from "@/hooks/useFetcherCallback";
import useUser from "@/hooks/useUser";
import { ChakraBox } from "@/layout/global/MotionComponents";
import { Button, Flex, Icon, useToast } from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { memo, useCallback, useState } from "react";
import { BiBookmark } from "react-icons/bi";

export const tabs = [
	{
		name: "Comments",
		value: "comments"
	},
	{
		name: "Checks",
		value: "checks"
	}
] as const;

interface Props {
	tab: string;
	setTab: Dispatch<SetStateAction<(typeof tabs)[number]["value"]>>;
	isSaved: boolean;
	// counts: {
	// 	comments: number | undefined;
	// 	checks: number | undefined;
	// };
}

export default memo(function Tabs({ tab, setTab, isSaved }: Props) {
	const [saved, setSaved] = useState(isSaved);

	const saveFetcher = useFetcherCallback((data) => {
		if (data?.success) {
			toast({
				title: saved ? "Successfully bookmarked server!" : "Successfully removed server from bookmarks!",
				status: "success"
			});
		}
	});
	const user = useUser();
	const navigate = useNavigate();

	const toast = useToast();

	const handleSave = useCallback(() => {
		if (!user) return navigate("/login");

		setSaved((prev) => !prev);
		saveFetcher.submit(
			{
				action: "save"
			},
			{
				method: "PATCH"
			}
		);
	}, [user, saveFetcher, navigate]);

	return (
		<Flex
			justifyContent={"space-between"}
			w="100%"
			gap={4}
			alignItems={{
				base: "flex-start",
				md: "center"
			}}
			flexDirection={{ base: "column-reverse", md: "row" }}
		>
			<Flex gap={0}>
				{tabs.map((t) => (
					<Button
						variant={"ghost"}
						key={t.value}
						onClick={() => setTab(t.value)}
						size={"lg"}
						rounded={"none"}
						pos="relative"
					>
						{t.name}
						{/* ({(t.value === "comments" ? counts?.comments : counts?.checks) || "0"}) */}
						{tab === t.value && (
							<ChakraBox
								layout
								layoutId="tab-indicator"
								pos="absolute"
								bottom={0}
								left={0}
								right={0}
								h={"2px"}
								bg="brand"
							/>
						)}
					</Button>
				))}
			</Flex>

			<Button
				variant={saved ? "solid" : "outline"}
				borderColor={saved ? "yellow.500" : "transparent"}
				bg={saved ? "yellow.500" : "transparent"}
				rightIcon={<Icon as={BiBookmark} color={saved ? "white" : "yellow.500"} boxSize={5} />}
				color={saved ? "white" : "text"}
				onClick={handleSave}
				_hover={{
					bg: saved ? "yellow.600" : "alpha100"
				}}
			>
				{saved ? "Bookmarked" : "Bookmark"}
			</Button>
		</Flex>
	);
});
