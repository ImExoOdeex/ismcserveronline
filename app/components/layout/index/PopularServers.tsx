import { HStack, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai/index.js";
import Link from "~/components/utils/Link";

export default function PopularServers() {
	return (
		<VStack w="100%" justifyContent={"space-between"} spacing={10}>
			<Heading textAlign={"center"}>
				<HStack>
					<Text>Find your new favourite</Text>
					<Icon
						boxSize={"43px"}
						fill="currentcolor"
						alignItems={"cetner"}
						verticalAlign={"middle"}
						as={AiFillStar}
						color={"gold"}
					/>
					<Text>server!</Text>
				</HStack>
			</Heading>

			<VStack w="100%" spacing={5}>
				<Text fontSize={"lg"} lineHeight={"175%"} fontWeight={600} textAlign={"center"} color={"textSec"}>
					Explore over 2 thousand available servers in our database with our{" "}
					<Link variant={"link"} to="/popular-servers">
						popular-servers
					</Link>{" "}
					route! Our database contains the most played servers from around the world, ensuring that you'll find the most
					popular and exciting servers to join. Whether you're looking for a new community to join or a new challenge to
					take on, our popular servers route has got you covered. So start exploring now and join in on the fun!
				</Text>
			</VStack>
		</VStack>
	);
}
