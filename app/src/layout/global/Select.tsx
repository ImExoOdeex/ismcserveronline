import { Icon } from "@chakra-ui/icons";
import { Flex, Image, useColorModeValue } from "@chakra-ui/react";
import type { ControlProps, GroupBase, Props, SelectInstance } from "chakra-react-select";
import { Select as ReactChakraSelect, chakraComponents } from "chakra-react-select";
import { useRef } from "react";

interface CustomSelectProps {
	icon?: Element;
}

const components = {
	Input: (props: any) => <chakraComponents.Input {...props} autoComplete={"off"} readOnly />,
	Control: ({ children, ...props }: (ControlProps<unknown, false, any> & CustomSelectProps) | any) => {
		return (
			<chakraComponents.Control {...props}>
				<Flex gap={2} alignItems={"center"} w="100%">
					{props?.icon &&
						(typeof props?.icon === "string" ? (
							<Image src={props?.icon} h={6} ml={3} mr={-4} />
						) : (
							<Icon as={props?.icon as any} ml={3} mr={-4} boxSize={5} />
						))}
					{children}
				</Flex>
			</chakraComponents.Control>
		);
	},
	Option: ({ children, ...props }: any) => (
		<chakraComponents.Option {...props}>
			<Flex gap={3} alignItems={"center"} w="100%">
				{props.data?.icon &&
					(typeof props.data?.icon === "string" ? (
						<Image src={props.data?.icon} h={6} />
					) : (
						<Icon as={props.data?.icon} boxSize={5} />
					))}{" "}
				{children}
			</Flex>
		</chakraComponents.Option>
	)
};

export default function Select<Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>({
	container,
	list,
	...props
}: { container?: any; list?: any } & Props<Option, IsMulti, Group> & CustomSelectProps) {
	const ref = useRef<SelectInstance<Option, IsMulti, Group>>(null);
	const listBg = useColorModeValue("rgba(252, 252, 252, 0.9)", "rgba(17, 17, 23, 0.9)");

	return (
		<ReactChakraSelect
			ref={ref}
			useBasicStyles
			onMenuClose={() => {
				ref.current?.blur();
			}}
			chakraStyles={{
				control: (provided) => ({
					...provided,
					cursor: "pointer",
					bg: "alpha",
					border: "none",
					rounded: "lg",
					fontWeight: 600
				}),
				dropdownIndicator: (provided, { selectProps: { menuIsOpen } }) => ({
					...provided,
					"> svg": {
						transitionDuration: "normal",
						transform: `rotate(${menuIsOpen ? -180 : 0}deg)`
					},
					mr: 2,
					ml: -3,
					background: "transparent",
					border: "none",
					borderColor: "transparent",
					padding: "0px"
				}),
				container: (provided) => ({
					...provided,
					bg: "transparent",
					...container
				}),
				indicatorSeparator: (provided) => ({
					...provided,
					display: "none"
				}),
				input: (provided) => ({
					...provided,
					rounded: "xl",
					bg: "transparent"
				}),
				menuList: (provided) => ({
					...provided,
					bg: listBg,
					borderColor: "alpha300",
					...list
				}),
				option: (provided) => ({
					...provided,
					bg: "transparent",
					color: "text",
					fontWeight: 500,
					_hover: {
						bg: "alpha100",
						_selected: {
							bg: "brand.900",
							color: "whiteAlpha.900"
						}
					},
					_selected: {
						bg: "brand.900",
						color: "whiteAlpha.900"
					}
				})
			}}
			components={{
				...components,
				Control: (props: any) => <components.Control {...props} icon={(ref.current?.getValue()[0] as any)?.icon} />
			}}
			{...props}
		/>
	);
}
