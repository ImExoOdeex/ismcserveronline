import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { requireEnv } from "@/.server/functions/env.server";
import { csrf } from "@/.server/functions/security.server";
import { getSession } from "@/.server/session";
import { toStripeAmount } from "@/functions/payments";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import CouponForm from "@/layout/routes/prime/CouponForm";
import SubscriptionForm from "@/layout/routes/prime/SubscriptionForm";
import plans from "@/utils/plans";
import { CheckIcon } from "@chakra-ui/icons";
import {
    Box,
    Flex,
    HStack,
    Heading,
    Text,
    useColorMode,
    useColorModeValue
} from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useRef, useState } from "react";
import { useCountUp } from "react-countup";
import { redirect, typedjson } from "remix-typedjson";
import type { Stripe as StripeType } from "stripe";
import invariant from "tiny-invariant";

export async function loader({ request }: LoaderFunctionArgs) {
    csrf(request);
    const user = await getUser(request);

    if (user?.prime) {
        return redirect("/dashboard/prime");
    }
    if (!user) {
        return redirect("/login");
    }

    const session = await getSession(request.headers.get("Cookie"));
    const subType = session.get("subType") as "server" | "user";
    invariant(subType === "server" || subType === "user", "Invalid subType");

    const verifiedServers =
        subType === "server"
            ? await db.server.findMany({
                  where: {
                      owner_id: user.id
                  }
              })
            : [];

    return typedjson({
        ENV: {
            stripeKey: requireEnv("STRIPE_PUBLIC_KEY"),
            mode: process.env.NODE_ENV as "production" | "development" | "test"
        },
        subType,
        verifiedServers
    });
}

export function shouldRevalidate() {
    return false;
}

export default function PrimeSubscribe() {
    const { ENV, subType, verifiedServers } = useAnimationLoaderData<typeof loader>();

    // stripe promise
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setStripePromise(loadStripe(ENV.stripeKey as string));
    }, []);

    // colors
    const { colorMode } = useColorMode();
    const color = useColorModeValue("black", "white");
    const alpha = useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)");
    const alpha100 = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)");
    const borderRadius = "12px";
    const planColor = "brand.900";

    // price
    const plan = plans.find((p) => p.type === subType);
    invariant(plan, "Invalid plan");

    const [price, setPrice] = useState(plan.price);
    const [didStart, setDidStart] = useState(false);
    const countUpRef = useRef(null);
    const { update } = useCountUp({
        ref: countUpRef,
        end: plan.price,
        start: plan.price,
        duration: 2,
        decimals: 2,
        onStart: () => setDidStart(true),
        useEasing: true
    });

    // coupon
    const [addedCoupon, setAddedCoupon] = useState<StripeType.Response<StripeType.Coupon> | null>(
        null
    );
    console.log("addedCoupon", addedCoupon);

    useEffect(() => {
        if (addedCoupon) {
            const discount = (addedCoupon?.percent_off as number) / 100;
            const newPrice = plan.price - plan.price * discount;
            setPrice(newPrice);
            update(newPrice);
        }
    }, [addedCoupon, plan.price, update]);

    const [serverId, setServerId] = useState<number | null>(null);

    return (
        <Flex w="100%" maxW={"1400px"} mx={"auto"} flexDir={"column"} gap={10} px={4} mt={20}>
            <Flex
                w="100%"
                gap={10}
                flexDir={{
                    base: "column",
                    md: "row"
                }}
            >
                <Flex w="100%" flexDir={"column"} gap={10}>
                    <Flex flexDir={"column"} gap={5}>
                        <Heading fontSize={"2xl"}>Start your {plan.title} subscription</Heading>

                        <Text>You can cancel your subscription at any time.</Text>
                    </Flex>

                    <Flex w="100%" justifyContent={"space-between"}>
                        <Flex flexDir={"column"} gap={1}>
                            <Text fontSize={"xs"}>Due now: </Text>
                            <Flex fontWeight={"semibold"} gap={1}>
                                <Box as="span" fontSize={"2xl"} color={planColor}>
                                    $
                                </Box>
                                <Text fontSize={"5xl"} ref={countUpRef}>
                                    {!didStart ? price : undefined}
                                </Text>
                            </Flex>
                        </Flex>

                        <CouponForm
                            addedCoupon={addedCoupon}
                            setAddedCoupon={setAddedCoupon}
                            color={planColor}
                            serverId={serverId}
                            isServer={plan.type === "server"}
                        />
                    </Flex>

                    <Elements
                        stripe={stripePromise}
                        options={{
                            mode: "subscription",
                            amount: toStripeAmount(plan.price),
                            currency: "usd",
                            loader: "always",
                            appearance: {
                                theme: colorMode === "light" ? "stripe" : "night",
                                labels: "floating",
                                rules: {
                                    ".StripeElement": {
                                        width: "100% !important"
                                    },
                                    ".Input": {
                                        backgroundColor: alpha,
                                        borderColor: "rgba(255,255,255,0.2)",
                                        color,
                                        borderRadius,
                                        transition: "all 0.2s"
                                    },
                                    ".Input:hover": {
                                        backgroundColor: alpha100,
                                        transition: "all 0.2s"
                                    },
                                    ".Input:autofill": {
                                        backgroundColor: "black"
                                    },
                                    ".Tab": {
                                        backgroundColor: alpha,
                                        color,
                                        borderColor: "rgba(255,255,255,0.2)",
                                        borderRadius,
                                        transition: "0s"
                                    },
                                    ".Tab:hover": {
                                        backgroundColor: alpha100,
                                        color,
                                        borderColor: "rgba(255,255,255,0.2)",
                                        borderRadius,
                                        transition: "0s"
                                    },
                                    ".Tab--selected:hover": {
                                        color,
                                        borderColor: "rgba(255,255,255,0.2)",
                                        borderRadius,
                                        transition: "0s"
                                    },
                                    ".Label": {
                                        color:
                                            colorMode === "light" ? "#000" : "rgba(255,255,255,0.7)"
                                    },
                                    ".Block": {
                                        borderRadius,
                                        backgroundColor: alpha,
                                        color,
                                        borderColor: "rgba(255,255,255,0.2)"
                                    }
                                }
                            }
                        }}
                    >
                        <style>
                            {`
				.StripeElement {
					width: 100% !important;
				}
			`}
                        </style>
                        <SubscriptionForm
                            verifiedServers={verifiedServers}
                            subType={subType}
                            coupon={addedCoupon?.id}
                            serverId={serverId}
                            setServerId={setServerId}
                        />
                    </Elements>
                </Flex>

                <Flex
                    minW={"325px"}
                    p={5}
                    flexDir={"column"}
                    gap={2}
                    rounded={"xl"}
                    bg={"alpha"}
                    border={"1px solid"}
                    borderColor={colorMode === "light" ? "#b5a7d1" : "#4b3d67"}
                >
                    <Text fontWeight={600} fontSize={"lg"}>
                        What do you get:
                    </Text>

                    <Flex flexDir={"column"} gap={3}>
                        {plan.features.map((pro) => (
                            <HStack key={pro} spacing={3}>
                                <CheckIcon color={"brand"} boxSize={4} />
                                <Text>{pro}</Text>
                            </HStack>
                        ))}
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
