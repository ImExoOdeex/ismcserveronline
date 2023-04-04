import { redirect, type LoaderArgs } from "@remix-run/node";
import { useOutlet } from "@remix-run/react";
import { getUser } from "~/components/server/db/models/getUser";
import { Divider, Heading, VStack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";

export async function loader({ request }: LoaderArgs) {
	const user = await getUser(request);

	if (!user) {
		return redirect("/login");
	}

	return null;
}

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
