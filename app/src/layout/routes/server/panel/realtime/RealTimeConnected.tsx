import { Button, Flex } from "@chakra-ui/react";
import { memo, useState } from "react";
import { Area, AreaChart, ReferenceLine, Tooltip, YAxis } from "recharts";

export default memo(function RealTimeConnected() {
	// fake cpu data usage
	const [data, setData] = useState([
		{
			name: new Date().toLocaleTimeString(),
			percent: 0
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 0
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 0
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 0
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 25
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 80
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 50
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 20
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 15
		},
		{
			name: new Date().toLocaleTimeString(),
			percent: 30
		}
	]);

	return (
		<>
			<AreaChart width={730} height={250} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#40cf77" stopOpacity={0.8} />
						<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
					</linearGradient>
				</defs>
				<YAxis domain={[0, 100]} includeHidden />
				<Tooltip
					animationEasing="ease-in-out"
					animationDuration={400}
					content={({ active, payload, label }) => {
						if (active) {
							return (
								<Flex p={2} bg={"rgba(255,255,255,0.9)"} rounded={"md"} color={"black"}>
									{payload![0].value}%
								</Flex>
							);
						}
						return null;
					}}
				/>

				<ReferenceLine y={25} stroke="#6a6a6a" strokeDasharray="3 10" />
				<ReferenceLine y={50} stroke="#6a6a6a" strokeDasharray="3 10" />
				<ReferenceLine y={75} stroke="#6a6a6a" strokeDasharray="3 10" />
				<ReferenceLine y={100} stroke="#6a6a6a" strokeDasharray="3 10" />
				<Area
					baseValue={0}
					max={100}
					min={0}
					type="natural"
					dataKey="percent"
					stroke="#82ca9d"
					fillOpacity={1}
					fill="url(#colorPv)"
					animationEasing="ease-out"
					animationDuration={1000}
				/>
			</AreaChart>

			<Button
				onClick={() =>
					setData((prev) => {
						// add new data and remove the first one
						const newData = [
							...prev,
							{
								name: new Date().toLocaleTimeString(),
								percent: prev[prev.length - 1].percent + Math.floor(Math.random() * 10)
							}
						];
						newData.shift();
						return newData;
					})
				}
			>
				Add data 10+
			</Button>

			<Button
				onClick={() =>
					setData((prev) => {
						// add new data and remove the first one
						const newData = [
							...prev,
							{
								name: new Date().toLocaleTimeString(),
								percent: prev[prev.length - 1].percent - Math.floor(Math.random() * 10)
							}
						];
						newData.shift();
						return newData;
					})
				}
			>
				Remove data 10-
			</Button>
		</>
	);
});
