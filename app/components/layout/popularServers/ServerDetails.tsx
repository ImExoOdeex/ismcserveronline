import { GridItem, SimpleGrid, Skeleton } from "@chakra-ui/react";

export default function ServerDetails({ data }: { data: any }) {
	console.log(data);

	// do not ask, im lazy af
	// const info = data?.data;

	return (
		<SimpleGrid minChildWidth={"150px"}>
			<GridItem>
				{/* {info ? (
					info.players.online + "/" + info.players.max
				) : (
					<Skeleton h="25px" />
				)} */}
				{data ? (
					<>{JSON.stringify(data)}</>
				) : (
					<Skeleton h={"25px"}></Skeleton>
				)}
			</GridItem>
		</SimpleGrid>
	);
}
