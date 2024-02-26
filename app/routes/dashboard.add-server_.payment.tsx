import { getUser } from "@/.server/db/models/user";
import { paymentHandlers } from "@/.server/payments/stripe";
import { commitSession, getSession } from "@/.server/session";
import { calculatePriceFromDays } from "@/functions/payments";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useRootData from "@/hooks/useRootData";
import { Button, Flex, Heading, Icon, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function shouldRevalidate() {
	return false;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));

	const server = await session.get("server");
	invariant(server, "Server not found in session");

	const days = await session.get("days");
	invariant(days, "Days not found in session");

	const user = await getUser(request);
	invariant(user, "User not found");

	const stripeKey = process.env.STRIPE_PUBLIC_KEY;
	invariant(stripeKey, "Stripe key not found");

	const paymentIntent = await paymentHandlers.createPaymentIntent(calculatePriceFromDays(days), user.email, days);

	return typedjson(
		{
			days,
			server,
			stripeKey,
			paymentIntent
		},
		{
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		}
	);
}

export default function DashboardAddServerPayment() {
	const { stripeKey, paymentIntent, server, days } = useAnimationLoaderData<typeof loader>();
	const stripePromise = loadStripe(stripeKey);

	const { colorMode } = useColorMode();

	// colors
	const color = useColorModeValue("black", "white");
	const alpha = useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)");
	const alpha100 = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)");
	const borderRadius = "12px";

	return (
		<Flex flexDir={"column"} gap={10}>
			<Flex flexDir={"column"}>
				<Heading fontSize={"2xl"}>
					{calculatePriceFromDays(days)}$ for {days} days of {server}
				</Heading>
				<Text>on our website's homepage</Text>
			</Flex>

			<Elements
				stripe={stripePromise}
				options={{
					clientSecret: paymentIntent.client_secret!,
					loader: "always",
					locale: "en",
					appearance: {
						theme: colorMode === "light" ? "stripe" : "night",
						labels: "floating",
						rules: {
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
								borderColor: "rgba(255,255,255,0.2)"
							}
						}
					}
				}}
			>
				<StripeForm server={server} paymentIntentId={paymentIntent.id} />
				<style>
					{`
                        .StripeElement {
                            width: 100% !important;
                        }
						
						#Field-countryInput option {
							color: #000;
						}
                    `}
				</style>
			</Elements>
		</Flex>
	);
}

interface StripeFormProps {
	server: string;
	paymentIntentId: string;
}

function StripeForm({ server, paymentIntentId }: StripeFormProps) {
	const fetcher = useFetcher();
	const stripe = useStripe();
	const elements = useElements();
	const { dashUrl } = useRootData();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitting(true);

		if (!stripe || !elements) {
			return;
		}

		const res = await fetch("/api/sample-server", {
			method: "POST",
			body: new URLSearchParams({
				server,
				paymentIntentId
			}),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		}).then((res) => res.json());

		if (!res.success) {
			console.log("api res", res);
			setError(res?.error || "Unknown error");
			setSubmitting(false);
			return;
		}

		console.log("api res", res);

		await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${dashUrl}/dashboard/add-server`
			},
			redirect: "always"
		});

		setSubmitting(false);
	}

	return (
		<fetcher.Form style={{ width: "100%" }} onSubmit={handleSubmit}>
			<Flex flexDir={"column"} gap={4} alignItems={"flex-end"} w="100%">
				<PaymentElement />
				<Button
					rightIcon={<Icon as={FiCreditCard} />}
					type="submit"
					variant="brand"
					isLoading={fetcher.state !== "idle" || submitting}
				>
					Confirm
				</Button>

				{error && (
					<Text fontWeight={500} color={"red"}>
						{error}
					</Text>
				)}
			</Flex>
		</fetcher.Form>
	);
}
