import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import Link from "~/components/utils/Link";

export default function LivecheckNumbers() {
	const [searchParams] = useSearchParams();
	const number = Number(searchParams.get("number") ?? 1);

	const numbers = Array.from(Array(5).keys()).map((i) => i + 1);

	return (
		<HStack spacing={3}>
			{numbers.map((item) => (
				<Button
					as={Link}
					to={item === 1 ? `` : `?number=${item}`}
					variant={"ghost"}
					key={item}
					p={3}
					pos={"relative"}
					_hover={{ borderBottomRadius: item === number ? "none" : "", bg: "alpha", textDecoration: "none" }}
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
			))}
		</HStack>
	);
}
