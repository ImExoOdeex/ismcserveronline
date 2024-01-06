import { Button, Flex, HStack, Text, Tooltip } from "@chakra-ui/react";
import { useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import Link from "~/components/utils/Link";
import useUser from "~/components/utils/hooks/useUser";

export default function LivecheckNumbers() {
	const user = useUser();
	const [searchParams] = useSearchParams();
	const number = Number(searchParams.get("number") ?? 1);

	const numbers = Array.from(Array(5).keys()).map((i) => i + 1);

	function linkButtonProps(item: number) {
		if (!user?.prime && item >= 3) return {};

		return {
			to: item === 1 ? `` : `?number=${item}`
		};
	}

	return (
		<HStack spacing={3}>
			{numbers.map((item) => (
				<Tooltip
					key={item}
					hasArrow
					label={item >= 3 && !user?.prime ? "Prime required" : ""}
					aria-label="Prime required"
					isDisabled={item < 3 || user?.prime}
				>
					<Button
						as={item >= 3 && !user?.prime ? "button" : Link}
						{...linkButtonProps(item)}
						isDisabled={item >= 3 && !user?.prime}
						variant={"ghost"}
						p={3}
						pos={"relative"}
						_hover={{ borderBottomRadius: item === number ? "none" : "", bg: "alpha", textDecoration: "none" }}
						transition={"border-bottom-left-radius 0.2s ease-in-out, border-bottom-right-radius 0.2s ease-in-out"}
					>
						<Text fontWeight={500} fontSize={"xl"}>
							{item}
						</Text>
						{item === number && (
							<motion.div
								layoutId="numberUnderline"
								style={{
									position: "absolute",
									bottom: 0,
									left: 0,
									right: 0,
									width: "100%"
								}}
							>
								<Flex bg="brand" h="2px" w="100%" rounded={"sm"} />
							</motion.div>
						)}
					</Button>
				</Tooltip>
			))}
		</HStack>
	);
}
