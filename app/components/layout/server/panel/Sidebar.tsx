import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Flex, HStack, Icon, Image, Text, Tooltip } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { FiCpu, FiCreditCard, FiSettings } from "react-icons/fi";
import { MdOutlineWebhook } from "react-icons/md";
import Link from "~/components/utils/Link";
import VerifiedServersListModal from "./VerifiedServersListModal";

const buttons = [
	{
		name: "General",
		to: "",
		requiresSubscription: false,
		icon: FiSettings
	},
	{
		name: "Real-time data",
		to: "/real-time-data",
		requiresSubscription: true,
		icon: FiCpu
	},
	{
		name: "Webhook",
		to: "/webhook",
		requiresSubscription: false,
		icon: MdOutlineWebhook
	},
	{
		name: "Subscription",
		to: "/subscription",
		requiresSubscription: false,
		icon: FiCreditCard
	}
];

interface Props {
	server: string;
	bedrock: boolean;
	favicon: string | null;
}

export default function Sidebar({ server, bedrock, favicon }: Props) {
	const path = useLocation().pathname;

	const hasSubscription = false;

	return (
		<Flex
			flexDir={"column"}
			w="100%"
			maxW={{
				base: "100%",
				md: "300px"
			}}
		>
			<Flex w="100%" alignItems={"center"}>
				<HStack as={Link} to={`${bedrock ? "/bedrock" : ""}/${server}`} w="100%" mb={4}>
					<Image src={favicon ? favicon : "/mc-icon.png"} alt="Server icon" boxSize={16} />
					<Text fontSize="xl" fontWeight="bold">
						{server}
					</Text>
				</HStack>

				<VerifiedServersListModal />
			</Flex>

			{buttons.map((button) => {
				const isActive = path === `${bedrock ? "/bedrock" : ""}/${server}/panel${button.to}`;
				const shouldShowWarning = button.requiresSubscription && !hasSubscription;

				return (
					<Button
						key={button.to}
						as={Link}
						rounded={"none"}
						to={`${bedrock ? "/bedrock" : ""}/${server}/panel${button.to}`}
						variant={isActive ? "solid" : "ghost"}
						justifyContent={"flex-start"}
						leftIcon={<Icon as={button.icon} boxSize={5} mr={1} />}
					>
						<Flex w="100%" justifyContent="space-between">
							{button.name}
							{shouldShowWarning && (
								<Tooltip label="This feature requires prime subscription" hasArrow>
									<InfoOutlineIcon
										boxSize={4}
										color={"orange"}
										filter={"drop-shadow(0px 0px 6px rgba(255, 119, 0, 0.5))"}
									/>
								</Tooltip>
							)}
						</Flex>
					</Button>
				);
			})}
		</Flex>
	);
}
