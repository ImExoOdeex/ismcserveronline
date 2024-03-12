import type { FlexProps } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { memo, useMemo, useState } from "react";

interface Props {
	motd: string | null;
}

export default memo(function Motd({ motd, ...props }: Props & FlexProps) {
	const splitted = useMemo(() => motd?.split("\n"), [motd]);
	const [font, setFont] = useState<"Minecraft" | "EnchantingTable">("Minecraft");

	return (
		<Flex
			h={
				motd
					? {
							base: "auto",
							md: 20
					  }
					: 0
			}
			mt={{
				base: 20,
				md: 5
			}}
			w="100%"
			alignItems={"center"}
			justifyContent={"center"}
			flexDir={"column"}
			gap={2}
			pos="relative"
			onMouseEnter={() => {
				if (font === "Minecraft") setFont("EnchantingTable");
			}}
			onMouseLeave={() => {
				if (font === "EnchantingTable") setFont("Minecraft");
			}}
			{...props}
		>
			{splitted?.map((line, i) => (
				<Flex
					key={i}
					w="100%"
					justifyContent="center"
					alignItems={"center"}
					fontFamily={font}
					fontWeight={500}
					fontSize={
						font === "Minecraft"
							? {
									base: "sm",
									md: "lg",
									xl: "xl"
							  }
							: {
									base: "10px",
									md: "sm"
							  }
					}
					dangerouslySetInnerHTML={{ __html: line }}
					gap={1}
					flexWrap={"nowrap"}
					flexDir={"row"}
					wrap={"nowrap"}
					rel="ugc"
				/>
			))}
		</Flex>
	);
});
