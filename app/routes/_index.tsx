import { db } from "@/.server/db/db";
import { cache } from "@/.server/db/redis";
import { isAddress } from "@/.server/functions/validateServer";
import serverConfig from "@/.server/serverConfig";
import { getCookieWithoutDocument } from "@/functions/cookies";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import Main from "@/layout/routes/index/Main";
import TopServers from "@/layout/routes/index/TopServers";
import { Flex } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import dayjs from "dayjs";
import { useState } from "react";
import { typedjson } from "remix-typedjson";
import { getClientLocales } from "remix-utils/locales/server";
import type { SearchServer, SearchTag } from "~/routes/search";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();

	const bedrock = getCookieWithoutDocument("bedrock", request.headers.get("cookie") ?? "") === "true";
	const server = formData.get("server")?.toString().toLowerCase();
	if (!server) {
		return null;
	}

	if (isAddress(server)) {
		return redirect(`/${bedrock ? "bedrock/" : ""}${server}`);
	}
	return redirect("/search?q=" + server);
}

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "#1 Minecraft server list & status checker | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const cookies = request.headers.get("Cookie");
	const bedrock = getCookieWithoutDocument("bedrock", cookies ?? "") === "true";
	const query = getCookieWithoutDocument("query", cookies ?? "") === "true";

	let cookieLocale = getCookieWithoutDocument("locale", request.headers.get("Cookie") ?? "");
	cookieLocale = cookieLocale === "us" ? "en" : cookieLocale;
	const locales = getClientLocales(request);
	const locale = locales ? (locales[0].split("-")[0] === "us" ? "en" : locales[0].split("-")[0]) : "en";

	const url = new URL(request.url);
	const spLocale = url.searchParams.get("lang");

	let finalLocale = spLocale || cookieLocale || locale;
	finalLocale = finalLocale === "us" ? "en" : finalLocale;

	const cacheServersKey = `servers-${bedrock}-hot-${finalLocale}`;
	const cacheServersStr = await cache.get(cacheServersKey);
	const cacheServers = cacheServersStr ? JSON.parse(cacheServersStr) : null;
	const cacheTagsStr = await cache.get(`tags`);
	const cacheTags = cacheTagsStr ? JSON.parse(cacheTagsStr) : null;

	let servers: SearchServer[] = cacheServers || [];
	let tags: SearchTag[] = cacheTags || [];

	if (!cacheServers || !cacheTags) {
		console.log("no cache");

		const promises = [
			db.tag.findMany({
				take: 8,
				select: {
					name: true
				},
				orderBy: {
					servers: {
						_count: "desc"
					}
				}
			}) as Promise<SearchTag[]>,
			db.server.findMany({
				take: 4,
				select: {
					id: true,
					server: true,
					bedrock: true,
					favicon: true,
					players: true,
					prime: true,
					motd: true,
					description: true,
					owner_id: true,
					Owner: {
						select: {
							prime: true
						}
					},
					Tags: {
						select: {
							name: true
						}
					},
					_count: {
						select: {
							Vote: {
								where: {
									created_at: {
										gte: dayjs().startOf("month").toDate()
									}
								}
							}
						}
					}
				},
				where: {
					AND: {
						bedrock,
						AND: {
							OR: [
								{
									language: finalLocale === "en" ? "en" : finalLocale
								},
								{
									language: finalLocale === "en" ? null : finalLocale
								}
							]
						},
						server: {
							startsWith: "%.%",
							not: {
								startsWith: "%.%.%.%"
							}
						}
					}
				},
				orderBy: {
					Vote: {
						_count: "desc"
					}
				}
			}) as unknown as Promise<SearchServer[]>
		] as const;

		const [fetchedTags, fetchedServers] = await Promise.all(promises);
		servers = fetchedServers;
		tags = fetchedTags;

		const cacheTTL = serverConfig.cache.searchServersNTags;
		await Promise.all([
			cache.set(cacheServersKey, JSON.stringify(fetchedServers), cacheTTL),
			cache.set(`tags`, JSON.stringify(fetchedTags), cacheTTL)
		]);
	} else {
		console.log("cache");
	}

	// promoted-bedrock-locale-tags
	const promotedServersCacheKey = `promoted-${bedrock}-${finalLocale}`;
	const cachePromotedServersStr = await cache.get(promotedServersCacheKey);
	const cachePromotedServers = cachePromotedServersStr ? JSON.parse(cachePromotedServersStr) : null;

	let randomPromoted: { Server: SearchServer; color: string; id: number }[] = cachePromotedServers || [];

	if (!cachePromotedServers) {
		console.log("no cache promoted");

		const promotedCount = await db.promoted.count({
			where: {
				Server: {
					bedrock,
					language: finalLocale
				}
			}
		});
		const skip = Math.floor(Math.random() * promotedCount);
		randomPromoted = (await db.promoted.findMany({
			take: 2,
			select: {
				id: true,
				Server: {
					select: {
						id: true,
						favicon: true,
						server: true,
						description: true,
						bedrock: true,
						players: true,
						Tags: {
							select: {
								name: true
							}
						},
						_count: {
							select: {
								Vote: true
							}
						}
					}
				},
				color: true
			},
			skip,
			where: {
				Server: {
					bedrock,
					language: finalLocale
				},
				status: "Active"
			},
			orderBy: {
				created_at: "desc"
			}
		})) as any;

		await cache.set(promotedServersCacheKey, JSON.stringify(randomPromoted), serverConfig.cache.promotedServers);
	} else {
		console.log("cache promoted");
	}

	return typedjson({ bedrock, query, servers, tags, randomPromoted, count: 0 });
}

export default function Index() {
	const { bedrock, query, count, servers, randomPromoted, tags } = useAnimationLoaderData<typeof loader>();

	const [bedrockChecked, setBedrockChecked] = useState<boolean>(bedrock ? bedrock : false);
	const [serverValue, setServerValue] = useState<string>("");

	return (
		<Flex flexDir={"column"} maxW="1400px" mx="auto" w="100%" mt={"75px"} mb={10} px="4" gap={10}>
			<Main
				bedrockChecked={bedrockChecked}
				query={query}
				serverValue={serverValue}
				setBedrockChecked={setBedrockChecked}
				setServerValue={setServerValue}
				count={count}
				tags={tags}
			/>

			<TopServers servers={servers} promoted={randomPromoted} />

			{/* <SampleServers sampleServers={sampleServers} setServerValue={setServerValue} setBedrock={setBedrockChecked} />
			<Divider />
			<BotInfo />
			<Divider />
			<VStack spacing={"28"} w="100%" align={"start"}>
				<HowToUse />
				<PopularServers />
				<WARWF />
			</VStack> */}
		</Flex>
	);
}
