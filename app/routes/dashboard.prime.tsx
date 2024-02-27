import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { paymentHandlers, subscriptionHandlers } from "@/.server/modules/stripe";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useUser from "@/hooks/useUser";
import {
	Alert,
	AlertDescription,
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertIcon,
	AlertTitle,
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
import { FaHeartBroken } from "react-icons/fa";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);
	const user = await getUser(request, {
		prime: true,
		subId: true
	});
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
	csrf(request);
	const user = await getUser(request, {
		prime: true,
		subId: true,
		everPurchased: true
	});
	invariant(user, "User not found");

	const url = new URL(request.url);
	const paymentIntentId = url.searchParams.get("payment_intent");

	const [subscription, paymentIntent] = await Promise.all([
		user.subId ? subscriptionHandlers.retrieveSubscription(user.subId) : null,
		paymentIntentId ? paymentHandlers.retrievePaymentIntent(paymentIntentId).catch(() => null) : Promise.resolve(null)
	]);

	return typedjson({
		subscription,
		paymentIntent
	});
}

export default function DashboardPrime() {
	const { subscription, paymentIntent } = useAnimationLoaderData<typeof loader>();

	const user = useUser();

	const isCancelled = subscription?.cancel_at;

	const intlDate = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});

	useEffect(() => {
		if (paymentIntent && !user?.everPurchased) {
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	}, []);

	return (
		<Flex flexDir={"column"} gap={4} alignItems={"flex-start"}>
			<VStack align="start">
				<Heading fontSize={"2xl"}>Your Prime subscription</Heading>
				<Text>Thank you for supporting us!</Text>
			</VStack>

			<Divider />

			{paymentIntent && (
				<Alert
					status={
						paymentIntent.status === "succeeded"
							? "success"
							: paymentIntent.status === "processing"
							? "loading"
							: "error"
					}
					variant="subtle"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					textAlign="center"
					height="200px"
				>
					<AlertIcon boxSize="40px" mr={0} />
					<AlertTitle mt={4} mb={1} fontSize="lg">
						{paymentIntent.status === "succeeded"
							? "Payment succeeded"
							: paymentIntent.status === "processing"
							? "Payment processing"
							: "Payment failed"}
					</AlertTitle>
					<AlertDescription maxWidth="sm">
						{paymentIntent.status === "succeeded"
							? "Your payment has been succeeded, you now have prime subscription."
							: paymentIntent.status === "processing"
							? "Your payment is processing. You will be able to see your subscription, once payment been succeeded. Please refresh to check the status."
							: "Your payment has failed. Please try again."}
					</AlertDescription>
				</Alert>
			)}

			{subscription && (
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
			)}

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
