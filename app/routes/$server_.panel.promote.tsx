import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useServerPanelData from "@/hooks/useServerPanelData";
import NewCampaignModal from "@/layout/routes/server/panel/NewCampaignDrawer";
import config from "@/utils/config";
import {
	Divider,
	Flex,
	HStack,
	Heading,
	Image,
	Table,
	TableContainer,
	Tag,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr
} from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { MetaArgs, MetaFunction } from "@remix-run/react";
import { getAverageColor } from "fast-average-color-node";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ params, matches }: MetaArgs) {
	return [
		{
			title: `Promote ${params.server} | IsMcServer.online`
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function action({ request }: ActionFunctionArgs) {
	csrf(request);
	try {
		const user = await getUser(request, {
			id: true,
			ad_credits: true
		});
		invariant(user, "User not found");

		const form = await request.formData();
		const intent = form.get("intent") as "create";

		switch (intent) {
			case "create": {
				const serverId = Number(form.get("serverId") as string);
				const views = Number(form.get("views") as string);
				const tagsStr = form.get("tags") as string;
				invariant(serverId, "Server ID is required");
				invariant(views, "Views are required");

				invariant(views >= 10 && views <= 5000, "Views must be between 10 and 5000");

				const server = await db.server.findUnique({
					where: {
						id: serverId
					}
				});
				invariant(server, "Server not found");
				invariant(server.favicon, "Server favicon is required");
				invariant(server.language, "Server language is required");
				invariant(server.owner_id === user.id, "You are not the owner of this server");

				const adCredits = user.ad_credits;
				const doesUserHaveEnoughCredits = adCredits >= views / config.viewsPerCredit;
				invariant(doesUserHaveEnoughCredits, "You don't have enough credits");

				const tags = JSON.parse(tagsStr) as string[];

				const iconColor = await getAverageColor(server.favicon).then((color) => color.hex);

				const [promoted] = await db.$transaction([
					db.promoted.create({
						data: {
							server_id: serverId,
							views_limit: views,
							color: iconColor,
							Tags: {
								connect: tags.map((tag) => ({
									name: tag
								}))
							}
						}
					}),
					db.user.update({
						where: {
							id: user.id
						},
						data: {
							ad_credits: {
								decrement: views / config.viewsPerCredit
							}
						}
					})
				]);

				return typedjson({
					success: true,
					promoted
				});
			}
			default: {
				throw new Error("Invalid intent");
			}
		}
	} catch (e) {
		console.error("e", e);
		return typedjson(
			{
				success: false,
				message: (e as Error).message
			},
			{ status: 500 }
		);
	}
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	csrf(request);
	const user = await getUser(request, {
		id: true,
		ad_credits: true
	});
	invariant(user, "User not found");

	const adCredits = user.ad_credits;

	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[0] === "bedrock";

	const server = await db.server.findFirst({
		where: {
			server: params.server?.toLowerCase().trim(),
			bedrock
		},
		select: {
			id: true,
			server: true
		}
	});
	invariant(server, "Server not found");

	const ads = await db.promoted.findMany({
		where: {
			server_id: server.id
		},
		select: {
			id: true,
			server_id: true,
			status: true,
			views_limit: true,
			Server: {
				select: {
					server: true,
					favicon: true
				}
			},
			Tags: {
				select: {
					name: true
				}
			},
			_count: {
				select: {
					PromotedView: true
				}
			}
		}
	});

	return typedjson(
		{
			adCredits,
			ads
		},
		cachePrefetch(request)
	);
}

export default function ServerPanel() {
	const { adCredits, ads } = useAnimationLoaderData<typeof loader>();
	const server = useServerPanelData();

	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
			<Flex flexDir={"column"} gap={5}>
				<Flex flexDir={"column"} gap={1}>
					<Heading fontSize={"2xl"} fontWeight={600}>
						Your ads
					</Heading>
					<Text color="textSec">
						Ads are easy way to promote your server. You can create a new campaign with the available ad credits.
					</Text>
				</Flex>

				<Flex flexDir={"column"} gap={2}>
					<Text fontSize={"lg"} fontWeight={600}>
						Stats
					</Text>
					<Flex
						p={4}
						border="1px solid"
						borderColor={"alpha300"}
						rounded={"xl"}
						w="100%"
						gap={{
							base: 4,
							md: 10
						}}
						flexDir={{
							base: "column",
							md: "row"
						}}
					>
						<Flex flexDir={"column"} gap={1}>
							<Text fontWeight={500}>Ad Credits</Text>

							<Text fontSize={"lg"} fontWeight={600}>
								{adCredits}
							</Text>
						</Flex>

						<Flex flexDir={"column"} gap={1}>
							<Text fontWeight={500}>Active campaigns</Text>

							<Text fontSize={"lg"} fontWeight={600}>
								{ads.filter((ad) => ad.status === "Active").length}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				{!!ads.length && (
					<Flex flexDir={"column"} gap={2}>
						<Text fontSize={"lg"} fontWeight={600}>
							Active campaigns
						</Text>
						<TableContainer>
							<Table variant="simple">
								<Thead>
									<Tr>
										<Th>Server</Th>
										<Th>Tags</Th>
										<Th isNumeric>Views</Th>
										<Th isNumeric>Views Limit</Th>
										<Th>Status</Th>
									</Tr>
								</Thead>
								<Tbody>
									{ads.map((ad) => (
										<Tr key={ad.id}>
											<Td>
												<HStack>
													{ad.Server.favicon && <Image src={ad.Server.favicon} boxSize={10} />}
													<Text fontWeight={600}>{ad.Server.server}</Text>
												</HStack>
											</Td>
											<Td>
												{ad.Tags.length
													? ad.Tags.map((tag) => {
															return (
																<Tag key={"tag-" + tag.name} mr={1}>
																	{tag.name}
																</Tag>
															);
													  })
													: "No tags"}
											</Td>
											<Td isNumeric>{ad._count.PromotedView}</Td>
											<Td isNumeric>{ad.views_limit}</Td>
											<Td>{ad.status}</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</Flex>
				)}
			</Flex>

			<Divider />

			<Flex flexDir={"column"} gap={2}>
				<Text fontSize={"lg"} fontWeight={600}>
					Advertise
				</Text>
				<Flex flexDir={"column"} gap={2}>
					<Text fontWeight={500}>
						You can promote your server by creating an ad campaign. 1 Credit is equal to 20 views.
					</Text>

					<NewCampaignModal adCredits={adCredits} serverId={server.id} />
				</Flex>
			</Flex>
		</Flex>
	);
}
