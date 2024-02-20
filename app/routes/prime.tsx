import { CheckCircleIcon } from "@chakra-ui/icons";
import {
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	HStack,
	Heading,
	Icon,
	ListItem,
	Text,
	UnorderedList,
	VisuallyHiddenInput,
	useColorMode
} from "@chakra-ui/react";
import { ActionFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { FiCreditCard } from "react-icons/fi";
import { redirect } from "remix-typedjson";
import config from "~/components/config/config";
import { IPlan } from "~/components/types/typings";

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "Prime | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const free = formData.get("free") === "true";
	if (free) throw redirect(`/dashboard`);

	throw redirect(`subscribe`);
}

const plans = [
	{
		title: "Free",
		description: "Basic subscription",
		price: 0,
		color: "sec.900" as const,
		features: ["Up to 2 livecheck slots", "API ratelimit", "Up to 1.000 checks/month", "Ads"]
	},
	{
		title: "Prime",
		description: "Best subscription for the best people",
		price: 3.49,
		color: "brand.900" as const,
		features: ["More livecheck slots", "No API ratelimit", "Up to 100.000 checks/month", "Premium look & ads free"]
	}
] as IPlan[];

export default function Prime() {
	const { colorMode } = useColorMode();

	return (
		<Flex flexDir={"column"} maxW="1200px" mx="auto" gap={16} w="100%" mt={20} px={4} pb={20}>
			<Flex flexDir={"column"} w="100%" gap={4}>
				<Heading
					fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
					textAlign={"center"}
					bgClip="text"
					fontWeight={"extrabold"}
					bgGradient={`linear(to-r, text, ${colorMode === "light" ? "#d16ede" : "#da92e4"}, #866ec7, text, text, text)`}
				>
					Choose a plan, ideal for you!
				</Heading>

				<Text textAlign={"center"} color={"textSec"} maxW={"600px"} w="100%" alignSelf={"center"}>
					Choose a plan that suits you best, and enjoy the best of IsMcServer.online!
				</Text>
			</Flex>

			<Flex w="100%" flexDir={{ base: "column", md: "row" }} gap={10} maxW={"800px"} mx="auto">
				{plans.map((plan) => (
					<Plan key={plan.title} {...plan} />
				))}
			</Flex>

			<Flex flexDir={"column"} w="100%" gap={5} mt={10}>
				<Divider />

				<Text letterSpacing={"1px"}>
					Hey! This is one of my <i>side</i> project, and I'm not making any money from it (yes, even from ads). I need
					to pay yearly for the domain and monthly for a hosting. If you want to support us, buy a prime subscription or
					add your server on homepage. Thanks!
				</Text>
			</Flex>
		</Flex>
	);
}

function Plan({ title, price, features, description, color }: IPlan) {
	const { colorMode } = useColorMode();
	const fetcher = useFetcher();

	return (
		<Flex
			flexDir={"column"}
			bg="alpha"
			py={{
				base: 4,
				md: 5,
				lg: 6
			}}
			px={{
				base: 4,
				md: 6,
				lg: 8
			}}
			borderRadius={"2xl"}
			shadow={"xs"}
			gap={4}
			alignItems={"flex-start"}
			w={{ base: "100%", md: "50%" }}
			outline={colorMode === "light" ? "1px solid #b5a7d1" : "1px solid #4b3d67"}
			pb={20}
		>
			<Badge
				colorScheme={color === "sec" ? "sec" : "blue"}
				color={color === "sec.900" ? "sec" : colorMode === "light" ? "brand.900" : "brand.100"}
				bg={
					color === "sec.900"
						? "rgba(135, 179, 246, 0.16)"
						: colorMode === "light"
						? "rgba(174, 135, 246, 0.16)"
						: "rgba(199, 177, 239, 0.16)"
				}
				fontSize={"xs"}
			>
				{title}
			</Badge>

			<Flex flexDir={"column"} gap={2}>
				<Flex fontWeight={"semibold"} gap={1}>
					<Box as="span" fontSize={"2xl"} color={color}>
						$
					</Box>
					<Text fontSize={"5xl"}>{price}</Text>
				</Flex>

				<Text color={"textSec"}>{description}</Text>
			</Flex>

			<UnorderedList gap={2} listStyleType={"none"} listStylePos={"outside"} marginInlineStart={0} w="100%">
				{features.map((feature) => (
					<React.Fragment key={feature}>
						<ListItem
							p={4}
							borderTopRadius={feature === features[0] ? "2xl" : undefined}
							borderBottomRadius={feature === features[features.length - 1] ? "2xl" : undefined}
							_hover={{
								bg: "alpha"
							}}
							transition={`all 0.1s cubic-bezier(${config.ease.join(", ")})`}
						>
							<HStack spacing={5}>
								<CheckCircleIcon color={color} boxSize={5} />
								<Text color={"textSec"}>{feature}</Text>
							</HStack>
						</ListItem>

						{feature !== features[features.length - 1] && <Divider />}
					</React.Fragment>
				))}
			</UnorderedList>

			<fetcher.Form
				method="POST"
				style={{
					width: "100%"
				}}
			>
				<Button
					type="submit"
					isLoading={fetcher.state !== "idle"}
					bg={color}
					color={"white"}
					rightIcon={<Icon as={FiCreditCard} />}
					w="100%"
					transform={"auto-gpu"}
					_hover={{
						scale: 1.05
					}}
				>
					{price === 0 ? "Go to the dashboard" : "Choose this plan"}
				</Button>
				<VisuallyHiddenInput name="free" value={price === 0 ? "true" : "false"} readOnly />
			</fetcher.Form>
		</Flex>
	);
}
