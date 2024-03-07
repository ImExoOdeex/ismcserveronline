import { db } from "@/.server/db/db";
import { cache } from "@/.server/db/redis";
import serverConfig from "@/.server/serverConfig";
import { getCookieWithoutDocument } from "@/functions/cookies";
import { capitalize } from "@/functions/utils";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import { ChakraBox } from "@/layout/global/MotionComponents";
import PromotedServerCard from "@/layout/routes/search/PromotedServerCard";
import SearchForm from "@/layout/routes/search/SearchForm";
import ServerCard from "@/layout/routes/search/ServerCard";
import SideFilters from "@/layout/routes/search/SideFilters";
import { ServerModel } from "@/types/minecraftServer";
import { Button, Divider, Flex, HStack, Heading, Tag } from "@chakra-ui/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { MetaArgs, MetaFunction, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { redirect, typedjson } from "remix-typedjson";
import { getClientLocales } from "remix-utils/locales/server";

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "Search servers | IsMcServer.online"
		},
		...matches[0].meta
	] satisfies ReturnType<MetaFunction>;
}

export interface SearchServer {
	id: number;
	server: string;
	bedrock: boolean;
	favicon: string | null;
	players: ServerModel.Players<any>;
	prime: boolean;
	motd: ServerModel.Motd;
	owner_id: number | null;
	Owner: {
		prime: boolean;
	} | null;
	Tags: {
		name: string;
	}[];
	_count: {
		Vote: number;
	};
}

export interface SearchPromotedServer {
	Server: {
		favicon: string | null;
		server: string;
		bedrock: boolean;
		players: ServerModel.Players<any>;
		Tags: { name: string }[];
		_count: { Vote: number };
	};
}
[];

export interface SearchTag {
	name: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
	let cookieLocale = getCookieWithoutDocument("locale", request.headers.get("Cookie") ?? "");
	cookieLocale = cookieLocale === "us" ? "en" : cookieLocale;
	const locales = getClientLocales(request);
	const locale = locales ? (locales[0].split("-")[0] === "us" ? "en" : locales[0].split("-")[0]) : "en";

	const url = new URL(request.url);
	const spLocale = url.searchParams.get("lang");

	let finalLocale = spLocale || cookieLocale || locale;

	if (
		// if user has no cookie set, but locale is different from the default.
		(!cookieLocale && locale !== "en" && locale !== spLocale && !spLocale) ||
		// if user has cookie set, but is not yet redirected.
		(cookieLocale && cookieLocale !== "en" && cookieLocale !== spLocale)
	) {
		throw redirect(`/search?lang=${finalLocale}`);
	}
	finalLocale = finalLocale === "us" ? "en" : finalLocale;

	const isBedrock = url.searchParams.get("bedrock") === "";

	const query = url.searchParams.get("q");
	const sort = url.searchParams.get("sort") as "hot" | "newest" | "oldest" | undefined;
	const queryLetters = query?.split("");
	const paramsTags = url.searchParams.getAll("tag");
	console.log("paramsTags", paramsTags);

	const cacheServersKey = `servers-${isBedrock}-${sort ?? "hot"}-${finalLocale}-${paramsTags.join(",")}-${query ?? ""}`;
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
				take: 10,
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
				take: 10,
				select: {
					id: true,
					server: true,
					bedrock: true,
					favicon: true,
					players: true,
					prime: true,
					motd: true,
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
						bedrock: isBedrock,
						AND: {
							OR: [
								{
									language: finalLocale === "en" || finalLocale === "us" ? "en" : finalLocale
								},
								{
									language: finalLocale === "en" || finalLocale === "us" ? null : finalLocale
								}
							],
							...(() => {
								if (paramsTags.length > 0) {
									return {
										Tags: {
											some: {
												name: {
													in: paramsTags
												}
											}
										}
									};
								}
								return {};
							})()
						},
						OR: [
							{
								AND: [
									...(() => {
										if (queryLetters && queryLetters.length > 0) {
											return queryLetters.map((letter) => ({
												server: {
													contains: letter
												}
											}));
										}
										return [];
									})()
								]
							},
							(() => {
								if (!query) return {};

								return {
									Tags: {
										some: {
											name: {
												contains: query || undefined
											}
										}
									}
								};
							})()
						],
						server: {
							startsWith: "%.%",
							not: {
								startsWith: "%.%.%.%"
							}
						}
					}
				},
				orderBy: {
					...(() => {
						if (sort === "newest") {
							return {
								created_at: "desc"
							};
						}
						if (sort === "oldest") {
							return {
								created_at: "asc"
							};
						}

						return {
							Vote: {
								_count: "desc"
							}
						};
					})()
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
	const promotedServersCacheKey = `promoted-${isBedrock}-${finalLocale}-${paramsTags.join(",")}`;

	const cachePromotedServersStr = await cache.get(promotedServersCacheKey);
	const cachePromotedServers = cachePromotedServersStr ? JSON.parse(cachePromotedServersStr) : null;

	let randomPromoted: { Server: SearchServer; color: string }[] = cachePromotedServers || [];

	if (!cachePromotedServers) {
		console.log("no cache promoted");

		const promotedCount = await db.promoted.count({
			where: {
				Server: {
					bedrock: isBedrock,
					language: finalLocale === "us" ? "en" : finalLocale
				}
			}
		});
		const skip = Math.floor(Math.random() * promotedCount);
		randomPromoted = (await db.promoted.findMany({
			take: 2,
			select: {
				Server: {
					select: {
						id: true,
						favicon: true,
						server: true,
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
					bedrock: isBedrock,
					language: finalLocale === "us" ? "en" : finalLocale
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

	return typedjson({ tags, servers, locale: finalLocale, randomPromoted });
}

export default function Search() {
	const { tags, servers, locale, randomPromoted } = useAnimationLoaderData<typeof loader>();
	console.log("servers", servers);

	const versions = ["java", "bedrock"] as const;
	const [searchParams, setSearchParams] = useSearchParams();

	const [version, setVersion] = useState<(typeof versions)[number]>(searchParams.get("bedrock") === "" ? "bedrock" : "java");

	return (
		<Flex flexDir={"column"} maxW="1200px" mx="auto" w="100%" mt={"75px"} mb={10} px="4" gap={10}>
			{/* top  */}
			<Flex flexDir={"column"} gap={2}>
				<Heading size={"lg"}>Explore tousands of Minecraft Servers</Heading>
				<Divider mb={2} />

				<SearchForm />

				<HStack>
					{tags.map((tag) => (
						<Tag
							size={"lg"}
							onClick={() => {
								setSearchParams((prev) => {
									if (prev.getAll("tag").includes(tag.name)) {
										// filter out the tag
										prev.delete("tag", tag.name);

										return prev;
									}
									prev.append("tag", tag.name);
									return prev;
								});
							}}
							cursor={"pointer"}
							key={tag.name}
						>
							{tag.name}
						</Tag>
					))}
				</HStack>
			</Flex>

			{/* below top */}
			<Flex flexDir={"column"} gap={4}>
				<HStack>
					{versions.map((t) => (
						<Button
							px={8}
							variant={"ghost"}
							key={t}
							onClick={() => {
								setVersion(t);
								setSearchParams((prev) => {
									if (t === "bedrock") {
										prev.set("bedrock", "");
									} else {
										prev.delete("bedrock");
									}
									return prev;
								});
							}}
							size={"lg"}
							rounded={"none"}
							pos="relative"
						>
							{capitalize(t)}
							{version === t && (
								<ChakraBox
									layout
									layoutId="version-indicator"
									pos="absolute"
									bottom={0}
									left={0}
									right={0}
									h={"2px"}
									bg="brand"
								/>
							)}
						</Button>
					))}
				</HStack>

				<Flex
					flexDir={{
						base: "column",
						md: "row"
					}}
					w="100%"
					gap={4}
					justifyContent="space-between"
				>
					<Flex flexDir={"column"} w={{ base: "100%", md: "75%" }} gap={4}>
						<Flex flexDir={"column"} gap="1px">
							<Flex mb={2} flexDir={"column"} gap={"1px"}>
								{randomPromoted.map((server, i) => (
									<PromotedServerCard
										key={"promoted-" + server.Server.id}
										promoted={server}
										index={i}
										length={randomPromoted.length}
									/>
								))}
							</Flex>
							{servers.map((server, i) => (
								<ServerCard key={server.id} server={server} index={i} length={servers.length} />
							))}
						</Flex>
					</Flex>

					<SideFilters locale={locale} />
				</Flex>
			</Flex>
		</Flex>
	);
}