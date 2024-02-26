import Link from "@/layout/global/Link";
import config from "@/utils/config";
import {
	Link as ChakraLink,
	Code,
	Divider,
	Heading,
	ListItem,
	OrderedList,
	Text,
	UnorderedList,
	VStack,
	type ListItemProps
} from "@chakra-ui/react";
import { MetaArgs, MetaFunction } from "@remix-run/node";

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "Terms of Service | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export default function Tos() {
	function ListItemTitle({ children, ...props }: ListItemProps) {
		return (
			<ListItem fontWeight={"bold"} fontSize={"xl"} {...props}>
				{children}
			</ListItem>
		);
	}

	return (
		<VStack align={"start"} spacing={16} flexDir={"column"} maxW="1200px" mx="auto" w="100%" mt={"75px"} px="4" mb={16}>
			<Heading as="h2" size="2xl">
				Terms of Service
			</Heading>
			<OrderedList spacing={10} listStylePos={"inside"} marginInlineStart={0}>
				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<Divider />
					<ListItemTitle>Use of the Site</ListItemTitle>
					<Text>
						You may use the Site only for lawful purposes and in accordance with these Terms. You agree not to use the
						Site:
					</Text>
					<UnorderedList listStylePos={"inside"} spacing={2}>
						<ListItem>
							In any way that violates any applicable federal, state, local, or international law or regulation
							(including, without limitation, any laws regarding the export of data or software to and from the
							United States or other countries).
						</ListItem>
						<ListItem>
							To impersonate or attempt to impersonate ismcserver.online, a ismcserver.online employee, another
							user, or any other person or entity.
						</ListItem>
						<ListItem>
							To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Site, or
							which, as determined by us, may harm ismcserver.online or users of the Site or expose them to
							liability.
						</ListItem>
					</UnorderedList>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Intellectual Property Rights</ListItemTitle>
					<Text>
						The Site and its entire contents, features, and functionality (including but not limited to all
						information, software, text, displays, images, video, and audio, and the design, selection, and
						arrangement thereof), are owned by ismcserver.online, its licensors, or other providers of such material
						and are protected by United States and international copyright, trademark, patent, trade secret, and other
						intellectual property or proprietary rights laws.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Disclaimer of Warranties</ListItemTitle>
					<Text>
						ismcserver.online does not guarantee, represent, or warrant that your use of the Site will be
						uninterrupted or error-free, and you agree that from time to time, ismcserver.online may remove the Site
						for indefinite periods of time or cancel the Site at any time, without notice to you.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Limitation of Liability</ListItemTitle>
					<Text>
						In no event shall ismcserver.online, its officers, directors, employees, or agents, be liable to you for
						any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from
						any (i) errors, mistakes, or inaccuracies of content, (ii) personal injury or property damage, of any
						nature whatsoever, resulting from your access to and use of the Site, (iii) any unauthorized access to or
						use of our secure servers and/or any and all personal information and/or financial information stored
						therein, (iv) any interruption or cessation of transmission to or from the Site, (iv) any bugs, viruses,
						trojan horses, or the like, which may be transmitted to or through the Site by any third party, and/or (v)
						any errors or omissions in any content or for any loss or damage of any kind incurred as a result of your
						use of any content posted, emailed, transmitted, or otherwise made available via the Site, whether based
						on warranty, contract, tort, or any other legal theory.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Indemnification</ListItemTitle>
					<Text>
						You agree to indemnify, defend, and hold harmless ismcserver.online, its affiliates, licensors, and
						service providers, and its and their respective officers, directors, employees, contractors, agents,
						licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages,
						judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of
						or relating to your violation of these Terms or your use of the Site.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Governing Law</ListItemTitle>
					<Text>
						These Terms and any dispute or claim arising out of or in connection with them or their subject matter or
						formation (including without limitation any non-contractual disputes or claims), shall be governed by and
						construed in accordance with the laws of the State of California, without giving effect to any choice or
						conflict of law provision or rule (whether of the State of California or any other jurisdiction).
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Changes to the Terms</ListItemTitle>
					<Text>
						ismcserver.online may revise and update these Terms from time to time in its sole discretion. All changes
						are effective immediately when we post them, and apply to all access to and use of the Site thereafter.
						Your continued use of the Site following the posting of revised Terms means that you accept and agree to
						the changes.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Termination</ListItemTitle>
					<Text>
						ismcserver.online reserves the right to terminate your access to the Site at any time without notice for
						any reason whatsoever.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Miscellaneous</ListItemTitle>
					<Text>
						These Terms constitute the entire agreement between you and ismcserver.online regarding the use of the
						Site. If any provision of these Terms is held to be invalid or unenforceable, such provision shall be
						struck and the remaining provisions shall be enforced. ismcserver.online's failure to enforce any right or
						provision in these Terms shall not constitute a waiver of such right or provision unless acknowledged and
						agreed to by us in writing.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>API restrictions</ListItemTitle>
					<Text>
						Please <b>do not</b> ddos the API to keep fair user experience. Thanks!
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Adding Server Terms</ListItemTitle>

					<VStack align={"start"}>
						<Text>By adding server you agree to the following terms. If you don't agree, don't add your server.</Text>

						<Text>- You are not allowed to add servers that are not yours.</Text>
						<Text>- Your server should be online and contain favicon.</Text>
						<Text>- Your server should not contain any content that is not allowed by Mojang.</Text>
						<Text>- Make sure you add valid server, because we don't refund any payments.</Text>
						<Text>- Your server will be added to the list after the payment is successful.</Text>
						<Text>- We reserve the right to remove your server from the list without any reason.</Text>
						<Text>- Your server will be removed if it will be offline for so long.</Text>
						<Text>
							- You agree for placing your server on this website's homepage for the time you bought. If you want to
							remove your server from the homepage before the end of end date, contact us on discord.
						</Text>
					</VStack>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Prime Subscription Terms</ListItemTitle>

					<VStack align={"start"}>
						<Text>
							Prime subscription is a subscription plan that costs {config.primePrice} usd and adds some features to
							user account.
						</Text>

						<Text>- Subscription renews automatically every month. You can cancel it anytime in dashboard.</Text>
						<Text>
							- If you cancel your subscription, you will still have prime features until the end of the month you
							paid for.
						</Text>
						<Text>- We don't refund any payments.</Text>
						<Text>- We reserve the right to remove your prime subscription without any reason.</Text>
						<Text>- We reserve the right to change prime subscription price at any time.</Text>
						<Text>- We reserve the right to change prime subscription features at any time.</Text>
						<Text>- Prime subscription helps us to keep this website alive. Thanks for supporting us!</Text>
						<Text>
							- If you have any questions about prime subscription or need any help related to it, feel free to
							contact us on discord.
						</Text>
					</VStack>
				</VStack>
			</OrderedList>

			<Heading as={"h2"} fontSize={"3xl"}>
				Terms of Service and Privacy Policy of{" "}
				<Code colorScheme="purple" fontSize={"3xl"}>
					Is Minecraft Server Online
				</Code>{" "}
				discord bot
			</Heading>

			<OrderedList spacing={10} listStylePos={"inside"} marginInlineStart={0}>
				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<Divider />
					<ListItemTitle>Data deletion</ListItemTitle>
					<Text>
						If you want to pernamently delete your data from our database, you can just kick the bot. It will
						automatically delelete all livechecks and all config. If you want to make sure your data has been deleted
						you can join{" "}
						<ChakraLink href={config.discordServerInvite} color={"brand"}>
							Discord server
						</ChakraLink>{" "}
						and create a ticket or shot a dm to an admin!
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>Limitations</ListItemTitle>
					<Text>
						Users can make up to 5 livechecks per server. Livechecks cannot be on the one channel. You can
						enable/disable/edit the livechecks and config via the{" "}
						<Link to="/dashboard" color={"brand"}>
							dashboard
						</Link>
						.
					</Text>
				</VStack>

				<VStack w="100%" spacing={5} align={"start"} fontSize={"sm"}>
					<ListItemTitle>What do we store</ListItemTitle>
					<Text>
						We store your guild Id, channel Id and livecheck message Id as a data from discord. Of course we store
						your Minecraft server ip, it's edition, online and offline config colors as data provided from you in
						dashboard (if provided).
					</Text>
				</VStack>
			</OrderedList>

			<Text mt={5} fontSize={"sm"} fontWeight={"semibold"}>
				Copyright imexoodeex © {new Date().getFullYear()}
			</Text>
		</VStack>
	);
}
