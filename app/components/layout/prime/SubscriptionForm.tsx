import { Button, Flex, Icon, Image, Link, Text, VStack } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { FiCreditCard } from "react-icons/fi/index.js";

export default function SubscriptionForm() {
	const fetcher = useFetcher();
	const stripe = useStripe();
	const elements = useElements();
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitting(true);

		if (!stripe || !elements) {
			return;
		}

		const { error: submitError } = await elements.submit();
		if (submitError) {
			console.error(submitError.message);
			setSubmitting(false);
			return;
		}

		const { type, clientSecret, paymentIntentId } = await fetch("/api/stripe/subscribe", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			}
		}).then((res) => res.json());

		const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;

		const { error } = await confirmIntent({
			elements,
			clientSecret,
			redirect: "if_required", // redirecting manually, since webhooks are delayed and yes
			confirmParams: {
				return_url: `${window.location.origin}/dashboard`
			}
		});

		if (error) {
			setSubmitting(false);
			console.error(error);
			alert(error.message);
			return;
		} else {
			console.info("Redirecting manually...");

			// check if user has prime delivered by webhooks
			setTimeout(async () => {
				const res = await fetch("/api/user/prime", {
					method: "POST"
				}).then((res) => res.json());
				console.log("res", res);

				const newUrl =
					window.location.origin +
					"/dashboard/prime" +
					`?payment_intent=${paymentIntentId}&payment_intent_client_secret=${clientSecret}&redirect_status=succeeded`;

				if (res.prime) {
					console.log("redirecting immediately");
					window.location.href = newUrl;
				} else {
					console.log("redirecting in 1.5s");
					setTimeout(() => {
						window.location.href = newUrl;
					}, 1500);
				}
			}, 500);
		}
	}

	return (
		<fetcher.Form style={{ width: "100%" }} onSubmit={handleSubmit}>
			<VStack align={"start"} w="100%" spacing={5}>
				<PaymentElement
					options={{
						layout: "auto"
					}}
				/>
				<VStack align={"start"} w="100%">
					<Flex w="100%" justifyContent={"space-between"} gap={2}>
						<Button
							type="submit"
							variant="brand"
							isLoading={fetcher.state !== "idle" || submitting}
							rightIcon={<Icon as={FiCreditCard} />}
						>
							Confirm
						</Button>

						<Link href="https://stripe.com" isExternal>
							<Image src="/poweredbystripe.svg" alt="stripe" height={10} />
						</Link>
					</Flex>

					{submitting && (
						<Text color={"textSec"} fontWeight={600}>
							Your payment is being processed...
						</Text>
					)}
				</VStack>
			</VStack>
		</fetcher.Form>
	);
}
