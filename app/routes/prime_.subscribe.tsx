import { CheckIcon } from "@chakra-ui/icons";
import { Box, Flex, HStack, Heading, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { redirect, typedjson } from "remix-typedjson";
import config from "~/components/config/config";
import SubscriptionForm from "~/components/layout/prime/SubscriptionForm";
import { getUser } from "~/components/server/db/models/user";
import { toStripeAmount } from "~/components/utils/functions/payments";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUser(request);

	if (user?.prime) {
		return redirect("/dashboard/prime");
	} else if (!user) {
		return redirect("/login");
	}

	return typedjson({
		ENV: {
			stripeKey: process.env.STRIPE_PUBLIC_KEY,
			mode: process.env.NODE_ENV as "production" | "development" | "test"
		}
	});
}

export function shouldRevalidate() {
	return false;
}

const pros = ["Max livecheck slots", "No API ratelimits", "No ads & premium look of website", "More coming soon!"] as const;

export default function PrimeSubscribe() {
	const { ENV } = useAnimationLoaderData<typeof loader>();

	// stripe promise
	const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
	useEffect(() => {
		setStripePromise(loadStripe(ENV.stripeKey as string));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// colors
	const { colorMode } = useColorMode();
	const color = useColorModeValue("black", "white");
	const alpha = useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)");
	const alpha100 = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)");
	const borderRadius = "12px";
	const planColor = "brand.900";

	// price
	const price = config.primePrice;

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
						<Heading fontSize={"2xl"}>Start your Prime subscription</Heading>

						<Text>You can cancel your subscription at any time.</Text>
					</Flex>

					<Flex w="100%" justifyContent={"space-between"}>
						<Flex flexDir={"column"} gap={1}>
							<Text fontSize={"xs"}>Due now: </Text>
							<Flex fontWeight={"semibold"} gap={1}>
								<Box as="span" fontSize={"2xl"} color={planColor}>
									$
								</Box>
								<Text fontSize={"5xl"}>{price}</Text>
							</Flex>
						</Flex>
					</Flex>

					<Elements
						stripe={stripePromise}
						options={{
							mode: "subscription",
							amount: toStripeAmount(price),
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
										color: colorMode === "light" ? "#000" : "rgba(255,255,255,0.7)"
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
						<SubscriptionForm />
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
						{pros.map((pro) => (
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
