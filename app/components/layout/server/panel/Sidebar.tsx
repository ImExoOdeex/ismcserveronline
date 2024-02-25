import { Button, Flex } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import Link from "~/components/utils/Link";

const buttons = [
	{
		name: "General",
		to: ""
	},
	{
		name: "Real-time data",
		to: "/real-time-data"
	},
	{
		name: "Webhook",
		to: "/webhook"
	},
	{
		name: "Subscription",
		to: "/subscription"
	}
];

interface Props {
	server: string;
	bedrock: boolean;
}

export default function Sidebar({ server, bedrock }: Props) {
	const path = useLocation().pathname;

	return (
		<Flex flexDir={"column"} w="100%" maxW={"300px"}>
			{buttons.map((button) => {
				const isActive = path === `${bedrock ? "/bedrock" : ""}/${server}/panel${button.to}`;

				return (
					<Button
						key={button.to}
						as={Link}
						rounded={"none"}
						to={`${bedrock ? "/bedrock" : ""}/${server}/panel${button.to}`}
						variant={isActive ? "solid" : "ghost"}
						justifyContent={"flex-start"}
					>
						{button.name}
					</Button>
				);
			})}
		</Flex>
	);
}
