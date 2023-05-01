import { Flex, Heading, Icon, Skeleton, Text, VStack, VisuallyHiddenInput } from "@chakra-ui/react";
import { useEffect, useState, useContext } from "react";
import { BiColorFill } from "react-icons/bi";
import { context } from "~/components/utils/GlobalContext";

export default function StatusColor({ config, type }: { config: any; type: "online" | "offline" }) {
	const configColorDecimal: number = config[type === "online" ? "online_color" : "offline_color"];

	const [color, setColor] = useState<string>(`#${configColorDecimal.toString(16)}`);
	const [colorName, setColorName] = useState<string>("");
	const [colorFetching, setColorFetching] = useState<boolean>(false);

	useEffect(() => {
		const url = `https://www.thecolorapi.com/id?hex=${color.replace("#", "")}`;

		setColorFetching(true);
		const getData = setTimeout(() => {
			fetch(url, {
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then((res) => res.json())
				.then((res) => {
					setColorName(res.name.value);
					setColorFetching(false);
				});
		}, 100);

		return () => clearTimeout(getData);
	}, [color]);

	const { updateData } = useContext(context);

	function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.currentTarget.value;

		setColor(value);
		updateData("gradientColor", value);
	}

	return (
		<>
			<VStack w="100%" align={"start"}>
				<Text fontWeight={500} color={"textSec"} fontSize={"lg"}>
					{type === "online" ? "Online" : "Offline"} Status Color
				</Text>

				<VStack w="100%" align={"start"}>
					<Heading fontSize={"3xl"} opacity={colorFetching ? 0.5 : 1} transition={"opacity .2s"}>
						{colorName ? (
							colorName
						) : (
							<Skeleton h="36px" w="125px" rounded={"xl"} startColor="alpha200" endColor="transparent" />
						)}
					</Heading>

					<Flex rounded={"xl"} bg={color} h={"32"} w={{ base: "100%", md: "60" }} pos={"relative"}>
						<VisuallyHiddenInput
							id={`${type}Color`}
							name={`${type}Color`}
							type="color"
							value={color}
							onChange={handleColorChange}
							position={"absolute"}
							right={0}
							bottom={0}
							boxSize={7}
							maxW={7}
							p={`0 !important`}
							rounded={"lg"}
							bg="transparent"
							zIndex={1}
						/>
						<Flex
							_active={{ scale: 0.9 }}
							transform={"auto-gpu"}
							transition={"transform .2s"}
							cursor={"pointer"}
							as={"label"}
							htmlFor={`${type}Color`}
							position={"absolute"}
							right={1}
							bottom={1}
							boxSize={"7"}
							rounded={"lg"}
							bg={"whiteAlpha.900"}
							alignItems={"center"}
							justifyContent={"center"}
						>
							<Icon as={BiColorFill} color={"black"} />
						</Flex>
					</Flex>
				</VStack>
			</VStack>
		</>
	);
}
