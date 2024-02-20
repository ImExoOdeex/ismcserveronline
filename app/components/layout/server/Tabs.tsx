import { Button, Flex, Icon, useToast } from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Dispatch, SetStateAction, memo, useCallback, useEffect, useState } from "react";
import { BiBookmark } from "react-icons/bi";
import useUser from "~/components/utils/hooks/useUser";

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
			<Flex gap={2}>
				{tabs.map((t) => (
					<Button
						boxShadow={"sm"}
						key={t.value}
						onClick={() => setTab(t.value)}
						size={"sm"}
						rounded={"xl"}
						bg={tab === t.value ? "brand.500" : "transparent"}
						color={tab === t.value ? "white" : "text"}
						fontWeight={500}
						border="1px solid"
						borderColor={tab === t.value ? "transparent" : "alpha300"}
						px={4}
						py={4}
						_hover={{
							bg: tab === t.value ? "brand.600" : "alpha100"
						}}
					>
						{t.name}
					</Button>
				))}
			</Flex>

			<Button
				size={"sm"}
				py={4}
				variant={saved ? "solid" : "outline"}
				borderColor={"yellow.500"}
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
