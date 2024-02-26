import Link from "@/layout/global/Link";
import DiscordIcon from "@/layout/global/icons/DiscordIcon";
import {
	Divider,
	Flex,
	GridItem,
	HStack,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
	Text,
	VStack
} from "@chakra-ui/react";

export default function AddServerPopover() {
	return (
		<Popover isLazy placement="top">
			<PopoverTrigger>
				<GridItem
					role="note"
					aria-label="Add server popover"
					aria-labelledby="Add server popover"
					p={3 + " !important"}
					userSelect={"none"}
					rounded={"lg"}
					bg={"alpha"}
					color={"textSec"}
					transform={"auto-gpu"}
					transition={"all .2s"}
					_active={{ scale: 0.95, bg: "alpha200" }}
					_hover={{ bg: "alpha100", textDecor: "none" }}
					cursor={"pointer"}
				>
					<HStack spacing={5}>
						<Flex border={"2px dashed"} rounded={"md"} width={"64px"} height={"64px"} sx={{ aspectRatio: "1/1" }} />
						<Text fontWeight={"bold"} color={"text"}>
							Your.server.com! Add it in a couple of seconds!
						</Text>
					</HStack>
				</GridItem>
			</PopoverTrigger>
			<PopoverContent bg="bg" outlineColor={"transparent"} w={96}>
				<PopoverArrow bg="bg" />
				<PopoverCloseButton />
				<PopoverHeader fontWeight={"bold"} borderBottom={0}>
					Add your server there!
				</PopoverHeader>
				<PopoverBody>
					<VStack spacing={4}>
						<Text>If you want to add your server, login and go to the "Add Server" tab in your dashboard.</Text>

						<Divider my={2} />

						<Flex w="100%">
							<Link
								bg="discord.100"
								_hover={{ bg: "discord.900" }}
								color={"white"}
								w="100%"
								mb={2}
								rounded={"lg"}
								alignItems={"center"}
								justifyContent={"center"}
								display={"flex"}
								py={2}
								fontWeight={600}
								to="/dashboard/add-server"
							>
								<HStack>
									<DiscordIcon />
									<Text>Login</Text>
								</HStack>
							</Link>
						</Flex>
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
}
