import { modelConfig } from "@/layout/routes/index/three/McModel";
import { Box, Spinner } from "@chakra-ui/react";
import React, { forwardRef } from "react";

export function ModelLoader() {
	return (
		<Spinner
			size="xl"
			position="absolute"
			left="50%"
			top="50%"
			ml="calc(0px - var(--spinner-size) / 2)"
			mt="calc(0px - var(--spinner-size))"
		/>
	);
}

export const ModelContainer = forwardRef(({ children }: { children: React.ReactNode }, ref) => (
	<Box
		ref={ref as any}
		w={modelConfig.width + "px"}
		h={modelConfig.height + "px"}
		position="relative"
		ml={{
			base: "-200px"
		}}
		mt={{
			base: "-300px"
		}}
	>
		{children}
	</Box>
));

export default function Loader() {
	return (
		<ModelContainer>
			<ModelLoader />
		</ModelContainer>
	);
}
