import { db } from "@/.server/db/db";
import { getCache, setCache } from "@/.server/db/redis";
import { validateServer } from "@/.server/functions/validateServer";
import serverConfig from "@/.server/serverConfig";
import { getCookieWithoutDocument } from "@/functions/cookies";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import { Ad, adType } from "@/layout/global/ads/Yes";
import BotInfo from "@/layout/routes/index/BotInfo";
import HowToUse from "@/layout/routes/index/HowToUse";
import Main from "@/layout/routes/index/Main";
import PopularServers from "@/layout/routes/index/PopularServers";
import SampleServers from "@/layout/routes/index/SampleServers/SampleServers";
import WARWF from "@/layout/routes/index/WARWF";
import { Divider, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { typedjson } from "remix-typedjson";

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

	let sampleServers: any[], count: number;

	let [cacheCount, cacheServers] = (await Promise.all([
		getCache(Object.keys(serverConfig.cache)[0]), // count
		getCache(Object.keys(serverConfig.cache)[1]) // sampleServers
	])) as [string | null, string | null];

	if (!cacheServers || !cacheCount) {
		console.log("[Loader] No cache");

		[sampleServers, count] = (await Promise.all([[], db.check.count()])) as [any[], number];
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
