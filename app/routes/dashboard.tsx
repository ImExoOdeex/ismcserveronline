import type { SEOHandle } from "@balavishnuvj/remix-seo";
import { Divider, Heading, VStack } from "@chakra-ui/react";
import { redirect, type LoaderArgs } from "@remix-run/node";
import { useOutlet } from "@remix-run/react";
import { getUser } from "~/components/server/db/models/getUser";
import { commitSession, getSession } from "~/components/server/session.server";
import Link from "~/components/utils/Link";

export async function loader({ request }: LoaderArgs) {
	const user = await getUser(request);

	const url = new URL(request.url);
	const cookies = request.headers.get("Cookie");
	const session = await getSession(cookies);

	const redirectURLParam = url.searchParams.get("redirect") as string;
	const guildIDParam = url.searchParams.get("guild") as string;

	if (!user) {
		session.set("redirect", redirectURLParam);
		session.set("guild", guildIDParam);

		return redirect("/login", {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	if (redirectURLParam && guildIDParam) {
		return redirect(url.pathname);
	}

	const redirectURL = session.get("redirect");
	const guildID = session.get("guild");

	if (redirectURL) {
		session.unset("redirect");
		session.unset("guild");

		return redirect(`/dashboard/${guildID}${redirectURL === "index" ? "" : "/" + redirectURL}`, {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	return null;
}

export const handle: SEOHandle = {
	getSitemapEntries: () => null
};

export default function Dashboard() {
	const outlet = useOutlet();

	return (
		<VStack w="100%" maxW={"1200px"} mx="auto" align={"start"} mt={5} spacing={10} px={4}>
			<VStack w="100%" align={"start"}>
				<Heading fontSize={"5xl"} as={Link} to="/dashboard">
					Dashboard
				</Heading>
				<Divider />
			</VStack>
			{outlet}
		</VStack>
	);
}
