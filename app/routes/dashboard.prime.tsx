import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { paymentHandlers, subscriptionHandlers } from "@/.server/modules/stripe";
import { capitalize } from "@/functions/utils";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useFetcherCallback from "@/hooks/useFetcherCallback";
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
    Spinner,
    Text,
    VStack,
    useDisclosure
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Await } from "@remix-run/react";
import { Suspense, useEffect, useRef } from "react";
import { typeddefer, typedjson } from "remix-typedjson";
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

    const subscription = user.subId ? subscriptionHandlers.retrieveSubscription(user.subId) : null;
    const paymentIntent = paymentIntentId
        ? await paymentHandlers.retrievePaymentIntent(paymentIntentId).catch(() => null)
        : null;

    return typeddefer({
        subscription,
        paymentIntent
    });
}

export default function DashboardPrime() {
    const { subscription, paymentIntent } = useAnimationLoaderData<typeof loader>();

    const user = useUser();

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (paymentIntent && !user?.everPurchased) {
            timeout = setTimeout(() => {
                window.location.reload();
            }, 500);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [paymentIntent, user?.everPurchased]);

    return (
        <Flex flexDir={"column"} gap={4} alignItems={"flex-start"} w="100%">
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
                <Suspense
                    fallback={
                        <Flex alignItems={"center"} justifyContent={"center"} p={4} w="100%">
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
                                                    ? new Date(
                                                          data.current_period_end * 1000
                                                      ).toLocaleDateString()
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
                                            pointerEvents={
                                                data?.cancel_at_period_end ? "none" : "auto"
                                            }
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
                                        `Your subscription has been cancelled and will end on
									${new Date(data.current_period_end * 1000).toLocaleDateString()}. You won't be charged
									anymore.`}
                                </Text>
                            </Flex>
                        )}
                    </Await>
                </Suspense>
            )}
        </Flex>
    );
}

function CancelSubscriptionAlertDialog() {
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
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
                size={"lg"}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="bg">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Cancel Subscription
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to cancel your subscription? You will still have
                            access to prime features until the end of your current billing period.
                        </AlertDialogBody>

                        <AlertDialogFooter display={"flex"} gap={2}>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                bg="red.500"
                                color={"white"}
                                onClick={() => {
                                    fetcher.submit(null, {
                                        method: "DELETE"
                                    });
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
