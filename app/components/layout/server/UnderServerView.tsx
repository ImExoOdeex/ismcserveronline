import { CopyIcon } from "@chakra-ui/icons";
import { Button, Flex, Icon, useToast } from "@chakra-ui/react";
import { memo } from "react";
import { FaChevronUp } from "react-icons/fa";
import Link from "~/components/utils/Link";

interface Props {
	server: string;
	bedrock: boolean;
}

export default memo(function UnderServerView({ server, bedrock }: Props) {
	const toast = useToast();

	return (
		<Flex justifyContent={"flex-end"} w="100%" alignItems={"center"} gap={2}>
			<Button
				onClick={async () => {
					await navigator.clipboard.writeText(server);
					toast({
						title: "Copied IP!",
						duration: 5000,
						variant: "subtle",
						isClosable: true,
						status: "success",
						position: "bottom-right"
					});
				}}
				size="lg"
				rightIcon={<CopyIcon />}
			>
				Copy IP
			</Button>

			<Button
				size="lg"
				variant={"brand"}
				as={Link}
				to={`/${bedrock ? "bedrock/" : ""}${server}/vote`}
				rightIcon={<Icon as={FaChevronUp} />}
			>
				Vote
			</Button>
		</Flex>
	);
});
