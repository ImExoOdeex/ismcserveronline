import { Badge, Box, Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "../../utils/Link";
import APIButton from "./APIButton";
import FAQButton from "./FAQButton";
import LoginButton from "./LoginButton";
import HamburgerMenu from "./Mobile/HamburgerMenu";
import PopularServersButton from "./PopularServersButton";
import ServerSearch from "./ServerSearch";
import ThemeToggle from "./ToggleTheme";

type Props = {
	isMenuOpen: boolean;
	setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ isMenuOpen, setIsMenuOpen }: Props) {
	const [scrollPosition, setScrollPosition] = useState(0);
	const handleScroll = () => {
		const position = window.pageYOffset;
		setScrollPosition(position);
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const path = useLocation().pathname;

	return (
		<Flex
			as={"header"}
			w="100%"
			h={{ base: "60px", md: "80px" }}
			pos={"sticky"}
			top={0}
			backdropFilter={scrollPosition < 1 ? "none" : "blur(20px)"}
			zIndex={1799}
			borderBottom={"1px"}
			borderBottomColor={scrollPosition > 0 ? "alpha" : "transparent"}
			transition={"all .2s"}
		>
			<Flex w="100%" maxW={"1500px"} px={4} alignItems="center" h="100%" mx="auto" justifyContent={"space-between"}>
				<HStack spacing={5}>
					<Link to="/" alignItems={"center"} _hover={{ textDecor: "none" }}>
						<Heading fontSize="2xl" transition={"all .2s"} transform={"auto-gpu"} _active={{ scale: 0.95 }}>
							<HStack spacing={1} alignItems={"baseline"}>
								<Text>IsMcServer</Text>
								<Badge fontSize={"md"} rounded={"md"} py={0.5} px={1.5} colorScheme="green" h="fit-content">
									.online
								</Badge>
							</HStack>
						</Heading>
					</Link>
					<Flex display={{ base: "none", md: "flex" }} w="320px">
						<AnimatePresence mode="wait" initial={false}>
							{path !== "/" && (
								<motion.div
									style={{ width: "100%" }}
									initial={{ x: -40, opacity: 0, scale: 0.975 }}
									animate={{ x: 0, opacity: 1, scale: 1 }}
									exit={{
										x: -40,
										opacity: 0,
										scale: 0.975,
										transition: { duration: 0.2 }
									}}
									transition={{
										ease: [0.25, 0.1, 0.25, 1],
										duration: 0.33
									}}
								>
									<ServerSearch />
								</motion.div>
							)}
						</AnimatePresence>
					</Flex>
				</HStack>

				<HStack spacing={3} display={{ base: "none", lg: "flex" }}>
					<PopularServersButton />
					<FAQButton />
					<APIButton />
					<ThemeToggle />
					<LoginButton />
				</HStack>

				<Box display={{ base: "flex", lg: "none" }} cursor="pointer">
					<Button
						variant={"unstyled"}
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						display={"flex"}
						justifyContent={"center"}
						alignItems={"center"}
					>
						<HamburgerMenu isOpen={isMenuOpen} />
					</Button>
				</Box>
			</Flex>
		</Flex>
	);
}
