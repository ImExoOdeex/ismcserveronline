import { Divider, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { typedjson } from "remix-typedjson";
import { Ad, adType } from "~/components/ads/Yes";
import BotInfo from "~/components/layout/index/BotInfo";
import HowToUse from "~/components/layout/index/HowToUse";
import Main from "~/components/layout/index/Main";
import SampleServers from "~/components/layout/index/SampleServers/SampleServers";
import WARWF from "~/components/layout/index/WARWF";
import { db } from "~/components/server/db/db.server";
import { getCache, setCache } from "~/components/server/db/redis.server";
import { validateServer } from "~/components/server/functions/validateServer";
import serverConfig from "~/components/server/serverConfig.server";
import { SampleServerHomepage } from "~/components/types/typings";
import { getCookieWithoutDocument } from "~/components/utils/functions/cookies";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";
import PopularServers from "../components/layout/index/PopularServers";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const bedrock = getCookieWithoutDocument("bedrock", request.headers.get("cookie") ?? "") === "true";
	const query = getCookieWithoutDocument("query", request.headers.get("cookie") ?? "") === "true";
	const server = formData.get("server")?.toString().toLowerCase();

	if (!server) {
		return null;
	}

	const error = validateServer(server);
	if (error) return json({ error });

	return redirect(`/${bedrock ? "bedrock/" : ""}${server}${query && !bedrock ? "?query" : ""}`);
}

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "Minecraft server status | Get info of any Java and Bedrock servers"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const cookies = request.headers.get("Cookie");
	const bedrock = getCookieWithoutDocument("bedrock", cookies ?? "") === "true";
	const query = getCookieWithoutDocument("query", cookies ?? "") === "true";

	const start = Date.now();

	let sampleServers: SampleServerHomepage[], count: number;

	const timeoutPromise = new Promise((_resolve, reject) => {
		setTimeout(() => {
			reject(new Error("Timeout exceeded"));
		}, 2000); // 2 second timeout
	});

	let [cacheCount, cacheServers] = (await Promise.all([
		Promise.race([
			getCache(Object.keys(serverConfig.cache)[0]), // count
			timeoutPromise
		]).catch(() => 100_000),
		Promise.race([
			getCache(Object.keys(serverConfig.cache)[1]), // sampleServers
			timeoutPromise
		]).catch(() => "[]")
	])) as [string | null, string | null];

	if (!cacheServers || !cacheCount) {
		console.log("[Loader] No cache");

		[sampleServers, count] = (await Promise.all([
			Promise.race([
				db.sampleServer.findMany({
					select: {
						bedrock: true,
						server: true,
						favicon: true
					},
					orderBy: {
						add_date: "desc"
					},
					// get only servers that end dates are greater than now or null
					where: {
						AND: [
							{
								OR: [
									{
										end_date: {
											gte: new Date()
										}
									},
									{
										end_date: {
											equals: null
										}
									}
								]
							},
							{
								payment_status: "PAID"
							}
						]
					}
				}),
				timeoutPromise
			]).catch(() => []),

			Promise.race([db.check.count(), timeoutPromise]).catch(() => 100_000)
		])) as [SampleServerHomepage[], number];
		setCache(Object.keys(serverConfig.cache)[0], count, serverConfig.cache.count);
		setCache(Object.keys(serverConfig.cache)[1], sampleServers, serverConfig.cache.sampleServers);
	} else {
		console.log("[Loader] Using Cache");
		[sampleServers, count] = [JSON.parse(cacheServers ?? "[]"), Number(cacheCount)];
	}

	console.log(`[Loader] Sample servers and count took ${Date.now() - start}ms`);

	return typedjson({ bedrock, query, sampleServers, count });
}

export default function Index() {
	const { bedrock, sampleServers, query, count } = useAnimationLoaderData<typeof loader>();

	const [bedrockChecked, setBedrockChecked] = useState<boolean>(bedrock ? bedrock : false);
	const [serverValue, setServerValue] = useState<string>("");

	return (
		<VStack flexDir={"column"} maxW="1200px" mx="auto" w="100%" mt={"75px"} mb={10} px="4" spacing={14}>
			<Main
				bedrockChecked={bedrockChecked}
				query={query}
				serverValue={serverValue}
				setBedrockChecked={setBedrockChecked}
				setServerValue={setServerValue}
				count={count}
			/>

			<SampleServers sampleServers={sampleServers} setServerValue={setServerValue} setBedrock={setBedrockChecked} />

			<Divider />
			<BotInfo />
			<Divider />

			<VStack spacing={"28"} w="100%" align={"start"}>
				<HowToUse />

				<PopularServers />

				{/* What are you waiting for? */}
				<WARWF />
			</VStack>

			<Ad type={adType.multiplex} />
		</VStack>
	);
}
