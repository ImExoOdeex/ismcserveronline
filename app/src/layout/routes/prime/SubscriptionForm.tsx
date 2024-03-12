import Select from "@/layout/global/Select";
import { Button, Flex, Icon, Image, Link, Text, VStack } from "@chakra-ui/react";
import type { Server } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { FiCreditCard } from "react-icons/fi";

export default function SubscriptionForm({
	verifiedServers,
	subType
}: {
	verifiedServers: Server[];
	subType: "server" | "user";
}) {
	const fetcher = useFetcher();
	const stripe = useStripe();
	const elements = useElements();
	const [submitting, setSubmitting] = useState(false);

	const [serverId, setServerId] = useState<number | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitting(true);

		if (!stripe || !elements) {
			return;
		}

		const { error: submitError } = await elements.submit();
		if (submitError) {
			console.error("submitError.message", submitError.message);
			setSubmitting(false);
			return;
		}

		const { type, clientSecret, paymentIntentId } = await fetch("/api/stripe/subscribe", {
			method: "POST",
			body: new URLSearchParams({
				serverId: serverId?.toString() || ""
			})
		}).then((res) => res.json());

		const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;

		const redirectTo = window.location.origin + (subType === "server" ? `/server/${serverId}` : "/dashboard/prime");

		const { error } = await confirmIntent({
			elements,
			clientSecret,
			redirect: "if_required", // redirecting manually, since webhooks are delayed and yes
			confirmParams: {
				return_url: redirectTo
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
			if (subType === "user") {
				setTimeout(async () => {
					const res = await fetch("/api/user/prime", {
						method: "POST"
					}).then((res) => res.json());
					console.log("res", res);

					const newUrl =
						redirectTo +
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
			} else {
				const newUrl =
					redirectTo +
					`?payment_intent=${paymentIntentId}&payment_intent_client_secret=${clientSecret}&redirect_status=succeeded&prime=yes`;
				window.location.href = newUrl;
			}
		}
	}

	return (
		<fetcher.Form style={{ width: "100%" }} onSubmit={handleSubmit}>
			<Flex flexDir={"column"} gap={10} w="100%">
				{subType === "server" && (
					<Flex flexDir={"column"} gap={4} w="100%">
						<Text fontSize={"xl"} fontWeight={600}>
							Choose your server
						</Text>
						<Select
							isRequired
							value={{
								label: serverId ? verifiedServers.find((s) => s.id === serverId)?.server : "Select a server",
								value: serverId
							}}
							onChange={(server) => {
								setServerId((server as any)?.value as number);
							}}
							noOptionsMessage={() =>
								"It looks like you have no verified servers. Before you buy prime, verify the server you want to buy prime for."
							}
							options={
								(verifiedServers
									? verifiedServers.map((server) => ({
											label: server.server,
											value: server.id
									  }))
									: []) as any
							}
							container={{
								maxW: "300px"
							}}
							list={{
								maxW: "300px"
							}}
						/>
					</Flex>
				)}

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
							isDisabled={!serverId && subType === "server"}
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
			</Flex>
		</fetcher.Form>
	);
}
