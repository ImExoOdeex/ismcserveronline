import { Button, Flex, Icon, useToast } from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Dispatch, SetStateAction, memo, useCallback, useEffect, useState } from "react";
import { BiBookmark } from "react-icons/bi";
import useUser from "~/components/utils/hooks/useUser";
import { ChakraBox } from "../MotionComponents";

export const tabs = [
	{
		name: "Checks",
		value: "checks"
	},
	{
		name: "Comments",
		value: "comments"
	}
] as const;

interface Props {
	tab: string;
	setTab: Dispatch<SetStateAction<(typeof tabs)[number]["value"]>>;
	isSaved: boolean;
}

export default memo(function Tabs({ tab, setTab, isSaved }: Props) {
	const [saved, setSaved] = useState(isSaved);

	const saveFetcher = useFetcher();
	const user = useUser();
	const navigate = useNavigate();

	const toast = useToast();
	useEffect(() => {
		if ((saveFetcher.data as any)?.success) {
			toast({
				title: "Successfully saved server!",
				duration: 5000,
				variant: "subtle",
				isClosable: true,
				status: "success",
				position: "bottom-right"
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saveFetcher.data]);

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
		<Flex justifyContent={"space-between"} w="100%" alignItems={"center"}>
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
