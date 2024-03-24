import { memo } from "react";
import { Alert, AlertDescription, AlertTitle, Button, HStack } from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

interface Props {
	error: string;
	reconnect: () => void;
}

export default memo(function RealTimeError({ error, reconnect }: Props) {
	return (
		<>
			<Alert
				status="error"
				variant="subtle"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				textAlign="center"
				height="200px"
				py={4}
			>
				<InfoOutlineIcon
					pos="relative"
					top={{
						base: 2,
						md: 0
					}}
					boxSize={5}
					mr={0}
					color={"red"}
					filter={"drop-shadow(0px 0px 6px rgba(255, 119, 0, 0.5))"}
				/>
				<AlertTitle mt={4} mb={1} fontSize="lg">
					Oops
				</AlertTitle>
				<AlertDescription maxWidth="sm">{error}</AlertDescription>

				<HStack>
					<Button mt={4} colorScheme="red" variant={"ghost"} onClick={reconnect}>
						Reconnect
					</Button>
				</HStack>
			</Alert>
		</>
	);
});
