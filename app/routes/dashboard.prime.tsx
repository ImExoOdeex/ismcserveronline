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
	Heading,
	Text,
	VStack,
	useDisclosure
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { FaHeartBroken } from "react-icons/fa/index.js";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { getUser } from "~/components/server/db/models/user";
import { subscriptionHandlers } from "~/components/server/payments/stripe.server";

export async function action({ request }: ActionFunctionArgs) {
	const user = await getUser(request);
	invariant(user, "User not found");
	invariant(user.prime, "User does not have a subscription");
	invariant(user.subId, "User does not have a subscription");

	const cancelledSub = await subscriptionHandlers.cancelSubscription(user.subId);

	return typedjson({
		cancelledSub,
		success: true
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUser(request);
	invariant(user, "User not found");
	invariant(user.subId, "User does not have a subscription");
	invariant(user.prime, "User does not have a subscription");

	const subscription = await subscriptionHandlers.retrieveSubscription(user.subId);

	return typedjson({
		subscription
	});
}

export default function DashboardPrime() {
	const lastSubscription = useRef({});
	const { subscription } = useTypedLoaderData<typeof loader>() ?? { subscription: lastSubscription.current };
	useEffect(() => {
		if (subscription) lastSubscription.current = subscription;
	}, [subscription]);

	console.log(subscription);

	const isCancelled = subscription?.cancel_at;

	const intlDate = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});

	return (
		<Flex flexDir={"column"} gap={4} alignItems={"flex-start"}>
			<VStack align="start">
				<Heading fontSize={"2xl"}>Your Prime subscription</Heading>
				<Text>Thank you for supporting us!</Text>
			</VStack>

			<Divider />

			<Flex
				w="100%"
				justifyContent={"space-between"}
				flexDir={{
					base: "column",
					md: "row"
				}}
				gap={4}
			>
				<Flex flexDir={"column"} gap={0.5}>
					<Text fontWeight={500}>Prime Subscription Status</Text>
					<Text fontWeight={600} fontSize={"xl"} color={isCancelled ? "orange" : "green.600"}>
						{subscription?.cancel_at
							? "Your subscription is cancelled and will end on " +
							  intlDate.format(new Date(subscription.cancel_at! * 1000))
							: "Your subscription is active. Thanks <3"}
					</Text>
				</Flex>

				{!isCancelled && <CancelButton />}
			</Flex>

			{isCancelled && (
				<Text>
					Your subscription has been cancelled. You won't be charged anymore. You can still use Prime until{" "}
					{intlDate.format(new Date(subscription.cancel_at! * 1000))}. If you want to reactivate your subscription, you
					will be able to do that when your subscription ends. Thanks for supporting us!
				</Text>
			)}
		</Flex>
	);
}

function CancelButton() {
	const fetcher = useFetcher();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = useRef(null);

	return (
		<>
			<Button
				colorScheme="red"
				rightIcon={<FaHeartBroken />}
				onClick={onOpen}
				color={"white"}
				bg="red.500"
				_hover={{
					bg: "red.600"
				}}
				_active={{
					scale: 0.9
				}}
				transform={"auto-gpu"}
			>
				Cancel Subscription
			</Button>

			<AlertDialog isCentered isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} size={"lg"}>
				<AlertDialogOverlay>
					<AlertDialogContent bg="bg">
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Cancel Subscription
						</AlertDialogHeader>

						<AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

						<AlertDialogFooter display={"flex"} gap={2}>
							<Button
								ref={cancelRef}
								onClick={onClose}
								_active={{
									scale: 0.9
								}}
								transform={"auto-gpu"}
							>
								Cancel
							</Button>
							<fetcher.Form method="DELETE">
								<Button
									colorScheme="red"
									isLoading={fetcher.state !== "idle"}
									type="submit"
									color={"white"}
									bg="red.500"
									_hover={{
										bg: "red.600"
									}}
									_active={{
										scale: 0.9
									}}
									transform={"auto-gpu"}
								>
									Cancel
								</Button>
							</fetcher.Form>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
}
