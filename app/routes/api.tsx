import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useUser from "@/hooks/useUser";
import Link from "@/layout/global/Link";
import DiscordIcon from "@/layout/global/icons/DiscordIcon";
import type { MinecraftServerWoQuery } from "@/types/minecraftServer";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
	Badge,
	Box,
	Code,
	Flex,
	HStack,
	Heading,
	Icon,
	ListItem,
	OrderedList,
	Stack,
	Text,
	Tooltip,
	VStack,
	useClipboard,
	useColorModeValue
} from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import crypto from "crypto";
import { FaCode } from "react-icons/fa";
import { typedjson } from "remix-typedjson";

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "API | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sampleToken = crypto.randomUUID();

	return typedjson({ sampleToken }, cachePrefetch(request));
}

const data: Omit<MinecraftServerWoQuery, "favicon"> = {
	online: true,
	host: "mc.hypixel.net",
	port: 25565,
	version: {
		array: ["1.8 / 1.19"],
		string: "Requires MC 1.8 / 1.19"
	},
	players: {
		online: 54029,
		max: 200000,
		list: []
	},
	protocol: 47,
	software: "Requires MC 1.8 / 1.19",
	motd: {
		raw: "§f                §aHypixel Network §c[1.8-1.19]§f\n   §c§lLUNAR MAPS §6§lCOSMETICS §7| §d§lSKYBLOCK 0.17.3",
		clean: "                Hypixel Network [1.8-1.19]\n   LUNAR MAPS COSMETICS | SKYBLOCK 0.17.3",
		html: '<span><span style="color: #FFFFFF;">                </span><span style="color: #55FF55;">Hypixel Network </span><span style="color: #FF5555;">[1.8-1.19]</span><span style="color: #FFFFFF;">\n   </span><span style="color: #FF5555; font-weight: bold;">LUNAR MAPS </span><span style="color: #FFAA00; font-weight: bold;">COSMETICS </span><span style="color: #AAAAAA;">| </span><span style="color: #FF55FF; font-weight: bold;">SKYBLOCK 0.17.3</span></span>'
	},
	ping: 107,
	debug: {
		status: true,
		query: false,
		legacy: false
	}
};

export default function Api() {
	const { sampleToken } = useAnimationLoaderData<typeof loader>();
	const user = useUser();

	const { onCopy, hasCopied } = useClipboard(`await fetch("https://api.ismcserver.online/hypixel.net", {
        headers: {
            "Authorization": "${sampleToken}"
        }
      }).then(res => res.json())`);

	const teal = useColorModeValue("teal.600", "teal.300");

	return (
		<>
			<VStack maxW={"1200px"} w="100%" align={"start"} mx="auto" px={4} spacing={10} mt={10}>
				<VStack align={"start"} w="100%">
					<Stack direction={{ base: "column", md: "row" }} w="100%" spacing={{ base: 10, md: 20 }}>
						{/* first column */}
						<VStack alignItems={"start"} textAlign={"left"} w="100%" spacing={6}>
							<Heading
								fontSize={{ base: "xl", sm: "2xl", lg: "4xl" }}
								letterSpacing={"1px"}
								lineHeight={"150%"}
								fontWeight={"semibold"}
							>
								<Box as="span">{"IsMcServer.online's "}</Box>
								<Badge colorScheme="green" fontSize={{ base: "xl", sm: "2xl", lg: "4xl" }} px={2} rounded={"xl"}>
									API
								</Badge>
							</Heading>
							<Text fontWeight={500} color={"textSec"}>
								IsMcServer.online API is a free-to-use API, that allows checking any Minecraft Server status. To
								generate API token join our Discord server and navigate to{" "}
								<Badge textTransform={"lowercase"}>#generate-token</Badge> text channel. Use{" "}
								<Badge textTransform={"lowercase"}>/generatetoken</Badge> command to get your new private token!
							</Text>
							<VStack spacing={2} w={{ base: "100%", sm: "unset" }}>
								<Flex flexDir={"column"} w="100%">
									<Tooltip hasArrow label={<>Sample token*</>} placement="top">
										<Flex
											rounded={"xl"}
											bg="alpha"
											fontWeight={"semibold"}
											px={{ base: 5, md: 10 }}
											py={1.5}
											fontFamily={"mono"}
											cursor={"not-allowed"}
											userSelect={"none"}
											_hover={{ opacity: 0.7 }}
											transition={".2s"}
											minW={{ base: "100%", sm: "unset" }}
											fontSize={{ base: "sm", md: "md" }}
										>
											<Text textAlign={"center"} w="100%">
												{sampleToken}
											</Text>
										</Flex>
									</Tooltip>
									<Text fontSize={"12px"} color="textSec" fontWeight={400}>
										Sample token*
									</Text>
								</Flex>

								<Link
									_hover={{
										textDecoration: "none",
										bg: "discord.900"
									}}
									h="40px"
									px={4}
									fontWeight={500}
									bg={user ? "brand.900" : "discord.100"}
									rounded={"xl"}
									w="100%"
									color={"white"}
									alignItems={"center"}
									userSelect={"none"}
									transform={"auto-gpu"}
									_active={{ scale: 0.9 }}
									to="/dashboard/token"
									variant={user ? "brand" : "solid"}
								>
									<HStack h={"100%"} alignItems={"center"} justifyContent={"center"} mx="auto">
										<Icon as={user ? FaCode : DiscordIcon} />
										<Text>{user ? "Go to the dashboard!" : "Log in to generate private token!"}</Text>
									</HStack>
								</Link>
							</VStack>
						</VStack>

						{/* second column */}
						<VStack
							alignItems={"center"}
							w="100%"
							maxW={{ base: "100%", md: "70%" }}
							spacing={0}
							justifyContent={"center"}
							minH="100%"
						>
							<Icon boxSize={64}>
								<svg viewBox="0 0 128 128">
									<path
										fill="currentColor"
										d="M112.771 30.334L68.674 4.729c-2.781-1.584-6.402-1.584-9.205 0L14.901 30.334C12.031 31.985 10 35.088 10 38.407v51.142c0 3.319 2.084 6.423 4.954 8.083l11.775 6.688c5.628 2.772 7.617 2.772 10.178 2.772 8.333 0 13.093-5.039 13.093-13.828v-50.49c0-.713-.371-1.774-1.071-1.774h-5.623C42.594 41 41 42.061 41 42.773v50.49c0 3.896-3.524 7.773-10.11 4.48L18.723 90.73c-.424-.23-.723-.693-.723-1.181V38.407c0-.482.555-.966.982-1.213l44.424-25.561c.415-.235 1.025-.235 1.439 0l43.882 25.555c.42.253.272.722.272 1.219v51.142c0 .488.183.963-.232 1.198l-44.086 25.576c-.378.227-.847.227-1.261 0l-11.307-6.749c-.341-.198-.746-.269-1.073-.086-3.146 1.783-3.726 2.02-6.677 3.043-.726.253-1.797.692.41 1.929l14.798 8.754a9.294 9.294 0 004.647 1.246c1.642 0 3.25-.426 4.667-1.246l43.885-25.582c2.87-1.672 4.23-4.764 4.23-8.083V38.407c0-3.319-1.36-6.414-4.229-8.073zM77.91 81.445c-11.726 0-14.309-3.235-15.17-9.066-.1-.628-.633-1.379-1.272-1.379h-5.731c-.709 0-1.279.86-1.279 1.566 0 7.466 4.059 16.512 23.453 16.512 14.039 0 22.088-5.455 22.088-15.109 0-9.572-6.467-12.084-20.082-13.886-13.762-1.819-15.16-2.738-15.16-5.962 0-2.658 1.184-6.203 11.374-6.203 9.105 0 12.461 1.954 13.842 8.091.118.577.645.991 1.24.991h5.754c.354 0 .692-.143.94-.396.24-.272.367-.613.335-.979-.891-10.568-7.912-15.493-22.112-15.493-12.631 0-20.166 5.334-20.166 14.275 0 9.698 7.497 12.378 19.622 13.577 14.505 1.422 15.633 3.542 15.633 6.395 0 4.955-3.978 7.066-13.309 7.066z"
									></path>
								</svg>
							</Icon>
						</VStack>
					</Stack>
				</VStack>

				<VStack w="100%" align={"start"}>
					<VStack w="100%" align={"start"} spacing={16}>
						<VStack w="100%" alignItems={"start"} spacing={2}>
							<Heading fontSize={"xl"}>How to use the API?</Heading>
							<Text>
								To use the api, enter your generated token into <Badge>Authorization</Badge> header, like shown on
								example below. It is important to note that API tokens should be kept secure and not shared with
								unauthorized users.
							</Text>

							<Box as="pre" w="100%">
								<Code
									p={5}
									rounded={"md"}
									pos={"relative"}
									role="group"
									overflowX={"scroll"}
									overflow={"auto"}
									w="100%"
									bg="alpha100"
								>
									<Flex>
										<Box as="span" color={teal}>
											await{" "}
										</Box>
										fetch(
										<Box as="span" color={"green"}>
											"https://api.ismcserver.online/hypixel.net"
										</Box>
										, {`{`}
									</Flex>
									<Flex>{`  headers: {`}</Flex>
									<Flex>
										<Box as="span" color={"green"}>
											{`      `}
											{`"Authorization"`}
										</Box>
										: <Box as="span" color={"green"}>{`"${sampleToken}"`}</Box>
										<Box as="span" color={"gray"}>{` // insert your token here`}</Box>
									</Flex>
									<Flex>{`  }`}</Flex>
									<Flex>{`}).then(res => res.json())`}</Flex>
									{hasCopied ? (
										<CheckIcon
											pos={"absolute"}
											right={2}
											bottom={2}
											display={"none"}
											_groupHover={{ display: "flex" }}
											cursor={"pointer"}
											onClick={() => onCopy()}
										/>
									) : (
										<CopyIcon
											pos={"absolute"}
											right={2}
											bottom={2}
											display={"none"}
											_groupHover={{ display: "flex" }}
											cursor={"pointer"}
											onClick={() => onCopy()}
										/>
									)}
								</Code>
							</Box>

							<Heading fontSize={"lg"}>In short:</Heading>
							<OrderedList listStylePosition={"inside"} lineHeight={"150%"} spacing={4}>
								<ListItem>
									Obtain an API token: You need to get an API token in order to use the API. This token is used
									to authenticate your API requests and ensure that your usage is authorized.
								</ListItem>
								<ListItem>
									Include the token in the request header: Once you have the API token, you need to include it
									in the "Authorization" header of your API request. This header is used to pass along your API
									token, so that the API server can verify your authorization.
								</ListItem>
								<ListItem>
									Send the API request: After you have included the API token in the request header, you can
									send the API request to the server and receive a response. The response will contain the data
									you requested, as well as any other relevant information.
								</ListItem>
								<ListItem>
									Keep your token secure: It is important to keep your API token secure and not share it with
									unauthorized users.
								</ListItem>
							</OrderedList>

							<Box pt={5}>
								<Text>See the example below to know what should be right API response.</Text>
							</Box>
						</VStack>

						<VStack w="100%" align={"start"} spacing={4}>
							<Heading fontSize={"xl"} letterSpacing={"1px"}>
								Hypixel.net - sample API response
							</Heading>

							<Box as="pre" w="100%">
								<Code p={5} rounded={"md"} overflowX={"scroll"} overflow={"auto"} w="100%" bg="alpha100">
									{`"online": ${data.online},
"host": "${data.host}",
"port": ${data.port},
"version": {
    "array": [
        "1.8 / 1.19"
    ],
    "string": "${data.version?.string}"
},
"players": {
    "online": ${data.players.online},
    "max": ${data.players.max},
    "list": [${data.players.list?.map((p) => (
		<p key={p.id}>{`{
            "id": ${p.id},
            "name": ${p.name}
        }`}</p>
	))}]
},
"protocol": ${data.protocol},
"software": "${data.software}",
"motd": {
    "raw": "${data.motd.raw}",
    "clean": "${data.motd.clean}",
    "html": "${data.motd.html}"
},
"favicon": "data:image/png;base64,iVBORw0...ORK5CYII=",
"ping": ${data.ping},
"debug": {
    "status": ${data.debug.status},
    "query": ${data.debug.query},
    "legacy": ${data.debug.legacy}
}
                        `}
								</Code>
							</Box>
						</VStack>
					</VStack>
				</VStack>
			</VStack>
		</>
	);
}
