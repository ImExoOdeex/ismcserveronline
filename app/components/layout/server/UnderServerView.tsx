import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { Button, Flex, HStack, Icon, Spinner, Text, useToast } from "@chakra-ui/react";
import { Await } from "@remix-run/react";
import { Suspense, memo } from "react";
import { TbSquareRoundedChevronsUpFilled } from "react-icons/tb";
import { AnyServer } from "~/components/types/minecraftServer";
import Link from "~/components/utils/Link";

interface Props {
	server: string;
	bedrock: boolean;
	promiseData: Promise<AnyServer>;
	voteCount: number | undefined;
}

export default memo(function UnderServerView({ server, bedrock, promiseData, voteCount }: Props) {
	const toast = useToast();

	return (
		<Flex
			justifyContent={"space-between"}
			w="100%"
			alignItems={"center"}
			gap={4}
			flexDirection={{ base: "column", md: "row" }}
		>
			<Flex>
				<Suspense
					fallback={
						<HStack>
							<Spinner color="orange" />
							<Text color={"orange"} fontSize="lg" fontWeight="bold">
								Loading real-time data
							</Text>
						</HStack>
					}
				>
					<Await resolve={promiseData}>
						{() => (
							<HStack>
								<CheckIcon color="green" />
								<Text color={"green"} fontSize="lg" fontWeight="bold">
									Using real-time data
								</Text>
							</HStack>
						)}
					</Await>
				</Suspense>
			</Flex>

			<Flex
				justifyContent={"flex-end"}
				alignItems={"center"}
				gap={2}
				w={{
					base: "100%",
					md: "auto"
				}}
			>
				<Button
					w={{
						base: "50%",
						md: "auto"
					}}
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
					w={{
						base: "50%",
						md: "auto"
					}}
					size="lg"
					variant={"brand"}
					as={Link}
					to={`/${bedrock ? "bedrock/" : ""}${server}/vote`}
					rightIcon={<Icon as={TbSquareRoundedChevronsUpFilled} boxSize={6} />}
				>
					Vote ({voteCount || 0})
				</Button>
			</Flex>
		</Flex>
	);
});
