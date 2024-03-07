import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import { subscriptionHandlers } from "@/.server/modules/stripe";
import { capitalize } from "@/functions/utils";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useFetcherCallback from "@/hooks/useFetcherCallback";
import useServerPanelData from "@/hooks/useServerPanelData";
import Link from "@/layout/global/Link";
import { InfoIcon } from "@chakra-ui/icons";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Divider,
	Flex,
	HStack,
	ListItem,
	Spinner,
	Text,
	Tooltip,
	UnorderedList,
	useDisclosure
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Await, MetaArgs, MetaFunction } from "@remix-run/react";
import { Suspense, useRef } from "react";
import { typeddefer, typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ data, matches, params }: MetaArgs) {
	return [
		{
			title: params.server + "'s prime subscription | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);

	const user = await getUser(request, {
		id: true
	});
	invariant(user, "User not found");

	const form = await request.formData();
	const serverId = form.get("serverId") as string;
	invariant(serverId, "Server ID not found");

	const userServerid = await db.server.findFirst({
		where: {
			id: Number(serverId),
			owner_id: user.id
		},
		select: {
			id: true,
			subId: true,
			prime: true
		}
	});
	invariant(userServerid, "Server not found for user");
	invariant(userServerid.prime, "Server has no prime");
	invariant(userServerid.subId, "Server has no subscription");

	const cancelledSub = await subscriptionHandlers.cancelSubscription(userServerid.subId);

	return typedjson({
		cancelledSub
	});
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[0] === "bedrock";

	const subscription = db.server
		.findFirst({
			where: {
				server: params.server?.toLowerCase(),
				bedrock
			},
			select: {
				id: true,
				subId: true,
				prime: true
			}
		})
		.then((server) => {
			if (!server) {
				throw new Error("Server not found");
			}
			if (server.subId && server.prime) {
				return subscriptionHandlers.retrieveSubscription(server.subId);
			}
			return null;
		});

	return typeddefer(
		{
			subscription
		},
		cachePrefetch(request)
	);
}

export default function ServerPanel() {
	const { subscription } = useAnimationLoaderData<typeof loader>();
	const { prime } = useServerPanelData();

	return (
		<Flex gap={5} w="100%" flexDir={"column"}>
			<Text fontSize={"2xl"} fontWeight={600}>
				Prime Subscription
			</Text>

			{prime && (
				<>
					<Suspense
						fallback={
							<Flex alignItems={"center"} justifyContent={"center"} p={4}>
								<Spinner />
							</Flex>
						}
					>
						<Await resolve={subscription}>
							{(data) => (
								<Flex flexDir={"column"} w="100%" gap={4}>
									<Flex
										p={4}
										rounded={"xl"}
										border={"1px solid"}
										borderColor={"alpha300"}
										flexDir={"column"}
										gap={2}
									>
										<Text fontSize={"xl"} fontWeight={500}>
											Current Subscription
										</Text>

										<Flex
											w="100%"
											justifyContent={"space-between"}
											gap={4}
											flexDir={{ base: "column", md: "row" }}
										>
											<Flex flexDir={"column"} gap={1}>
												<Text fontWeight={500}>Next billing date</Text>

												<Text fontSize={"lg"} fontWeight={600}>
													{data?.current_period_end
														? new Date(data.current_period_end * 1000).toLocaleDateString()
														: "No active subscription"}
												</Text>
											</Flex>

											<Flex flexDir={"column"} gap={1}>
												<Text fontWeight={500}>Status</Text>

												<Text
													fontSize={"lg"}
													fontWeight={600}
													color={
														data?.cancel_at_period_end
															? "orange"
															: data?.status === "active"
															? "green"
															: "orange"
													}
												>
													{data?.cancel_at_period_end
														? "Cancelled"
														: data?.status && capitalize(data?.status)}
												</Text>
											</Flex>

											<Flex
												flexDir={"column"}
												gap={1}
												opacity={data?.cancel_at_period_end ? 0.5 : 1}
												pointerEvents={data?.cancel_at_period_end ? "none" : "auto"}
											>
												<Text fontWeight={500}>Cancel Subscription</Text>
												<CancelSubscriptionAlertDialog />
											</Flex>
										</Flex>
									</Flex>

									<Divider my={6} />

									<Text>
										Hi, thank you for supporting us!
										{data?.cancel_at_period_end &&
											` Your subscription has been cancelled and will end on
											${new Date(data.current_period_end * 1000).toLocaleDateString()}. You won't be charged
											anymore.`}
									</Text>
								</Flex>
							)}
						</Await>
					</Suspense>
				</>
			)}

			{!prime && (
				<>
					<Text color="textSec">
						Hey, we have spent a lot of time and effort into making the best features for you and your server. Prime
						subscription is a way to support us and unlock all awesome features! It's your decision which prime plan
						you'll take :3
					</Text>
					<Flex flexDir={"column"} gap={2}>
						<Text fontSize={"xl"} fontWeight={500}>
							Server Prime
						</Text>
						<UnorderedList>
							<ListItem>Prime for specific server</ListItem>
							<ListItem>Custom background image</ListItem>
							<ListItem>Real-time server stats, including server & system info</ListItem>
							<ListItem>
								<HStack>
									<Text>2x less voting cooldown</Text>
									<Tooltip label="Users voting on your server will have 2x faster voting waiting time" hasArrow>
										<InfoIcon color="textSec" boxSize={4} cursor={"pointer"} />
									</Tooltip>
								</HStack>
							</ListItem>
							<ListItem>
								<HStack>
									<Text>Doubled votes on weekends</Text>
									<Tooltip label="User votes will be doubled on weekends" hasArrow>
										<InfoIcon color="textSec" boxSize={4} cursor={"pointer"} />
									</Tooltip>
								</HStack>
							</ListItem>
						</UnorderedList>
					</Flex>

					<Flex flexDir={"column"} gap={2}>
						<Text fontSize={"xl"} fontWeight={500}>
							User Prime
						</Text>
						<UnorderedList>
							<ListItem>
								<HStack>
									<Text>Prime for user and all owned servers</Text>
									<Tooltip label="User will have prime for every owned server" hasArrow>
										<InfoIcon color="textSec" boxSize={4} cursor={"pointer"} />
									</Tooltip>
								</HStack>
							</ListItem>
							<ListItem>
								<HStack>
									<Text>No voting cooldown</Text>
									<Tooltip label="User has no voting cooldown for every server" hasArrow>
										<InfoIcon color="textSec" boxSize={4} cursor={"pointer"} />
									</Tooltip>
								</HStack>
							</ListItem>
							<ListItem>
								<HStack>
									<Text>Doubled votes on weekends</Text>
									<Tooltip label="User votes will be doubled on weekends on any server" hasArrow>
										<InfoIcon color="textSec" boxSize={4} cursor={"pointer"} />
									</Tooltip>
								</HStack>
							</ListItem>
						</UnorderedList>
					</Flex>

					<Button size="lg" alignSelf={"flex-start"} as={Link} to="/prime">
						Check out plans
					</Button>
				</>
			)}
		</Flex>
	);
}

function CancelSubscriptionAlertDialog() {
	const { id } = useServerPanelData();
	const { isOpen, onClose, onOpen } = useDisclosure();
	const cancelRef = useRef(null);

	const fetcher = useFetcherCallback((data) => {
		console.log(data);
	});

	return (
		<>
			<Button
				colorScheme="red"
				variant={"unstyled"}
				h="min-content"
				p={0}
				color="textSec"
				fontSize={"lg"}
				fontWeight={600}
				textAlign={"left"}
				onClick={onOpen}
			>
				Cancel
			</Button>
			<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered size={"lg"}>
				<AlertDialogOverlay>
					<AlertDialogContent bg="bg">
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Cancel Subscription
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure you want to cancel your subscription? You will still have access to prime features until
							the end of your current billing period.
						</AlertDialogBody>

						<AlertDialogFooter display={"flex"} gap={2}>
							<Button ref={cancelRef} onClick={onClose}>
								Cancel
							</Button>
							<Button
								bg="red.500"
								color={"white"}
								onClick={() => {
									fetcher.submit(
										{
											serverId: id
										},
										{
											method: "DELETE"
										}
									);
								}}
								isLoading={fetcher.state !== "idle"}
							>
								Confirm
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
}
