import { Alert, AlertDescription, AlertIcon, AlertTitle, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import AddServerModal from "~/components/layout/dashboard/addServer/AddServerModal";
import YourServer from "~/components/layout/dashboard/addServer/YourServer";
import { db } from "~/components/server/db/db.server";
import { getUser } from "~/components/server/db/models/user";
import { paymentHandlers } from "~/components/server/payments/stripe.server";
import Link from "~/components/utils/Link";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUser(request);
	invariant(user, "User not found");

	const userServers = await db.sampleServer.findMany({
		where: {
			user_id: user.id
		}
	});

	const url = new URL(request.url);
	const paymentIntentId = url.searchParams.get("payment_intent");
	const paymentIntent = paymentIntentId ? await paymentHandlers.retrievePaymentIntent(paymentIntentId) : null;

	return typedjson({
		userServers,
		paymentIntent
	});
}

export default function DashboardAddServer() {
	const { userServers, paymentIntent } = useAnimationLoaderData<typeof loader>();

	return (
		<Flex gap={10} flexDir={"column"}>
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
							? "Your payment has been succeeded, your server has been added on homepage."
							: paymentIntent.status === "processing"
							? "Your payment is processing. You will be able to add your server once the payment is succeeded. Please refresh to check the status."
							: "Your payment has failed. Please try again."}
					</AlertDescription>
				</Alert>
			)}

			{!!userServers.length && (
				<Flex flexDir={"column"} gap={4}>
					<Heading fontSize={"2xl"}>Your servers</Heading>
					{userServers.map((server) => (
						<YourServer
							key={server.id}
							server={server}
							isLast={userServers.indexOf(server) === userServers.length - 1}
						/>
					))}
				</Flex>
			)}

			<Flex
				flexDir={{
					base: "column",
					md: "row"
				}}
				justifyContent={"space-between"}
				alignItems={{
					base: "start",
					md: "center"
				}}
				gap={4}
				rounded={"xl"}
				bg="alpha"
				p={4}
			>
				<VStack align="start">
					<Heading fontSize={"2xl"}>Add your server to the homepage</Heading>
					<Text>Support us by adding your server on our homepage!</Text>
				</VStack>
				<AddServerModal />
			</Flex>

			<Divider />

			<Text>
				Any payments made on your account will disable ads on your account lifetime. Users who have made any payment will
				also get premium look of the website. If you have any questions, please contact us on our{" "}
				<Link target="_blank" to="/discord">
					Discord
				</Link>
				.
			</Text>
		</Flex>
	);
}

export function shouldRevalidate() {
	return false;
}
