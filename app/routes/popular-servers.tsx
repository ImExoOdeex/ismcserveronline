import { VStack } from "@chakra-ui/react";
import { MetaArgs, type MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import { Ad, adType } from "~/components/ads/Yes";
import Main from "~/components/layout/popularServers/Main";
import { db } from "~/components/server/db/db.server";
import useAnimationLoaderData from "~/components/utils/hooks/useAnimationLoaderData";

export function meta({ matches }: MetaArgs) {
	return [
		{
			title: "Popular servers | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export async function loader() {
	// 1ms - 2ms to count for 2.5k servers
	const serverCount = await db.server.count();

	return typedjson({ serverCount });
}

export default function PopularServers() {
	const { serverCount } = useAnimationLoaderData<typeof loader>();

	return (
		<VStack maxW={"1200px"} w="100%" align={"start"} mx="auto" px={4} spacing={{ base: 8, md: "30px" }} mt={10}>
			<Main count={serverCount} />

			<Ad type={adType.small} />

			<Outlet />
		</VStack>
	);
}
