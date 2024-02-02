import { Badge, Box, Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PiCrownSimpleDuotone } from "react-icons/pi/index.js";
import Link from "../../utils/Link";
import { APIButton, FAQButton, LoginButton, PopularServersButton } from "./Buttons";
import HamburgerMenu from "./Mobile/HamburgerMenu";
import ServerSearch from "./ServerSearch";
import ThemeToggle from "./ToggleTheme";
import useRootData from "~/components/utils/hooks/useRootData";

type Props = {
	isMenuOpen: boolean;
	setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ isMenuOpen, setIsMenuOpen }: Props) {
	const [hasScrolled, setHasScrolled] = useState(false);

	function handleScroll(optimize = true) {
		const position = window.pageYOffset;
		if (optimize && position > 40) return;

		setHasScrolled(position > 10);
	}

	useEffect(() => {
		window.addEventListener("scroll", () => handleScroll(), { passive: true });
		handleScroll(false);

		return () => {
			window.removeEventListener("scroll", () => handleScroll());
		};
	}, []);

	const path = useLocation().pathname;
	const { isBot, user } = useRootData();

	return (
		<Flex
			as={"header"}
			w="100%"
			h={{ base: "60px", md: "70px" }}
			pos={"sticky"}
			top={0}
			backdropFilter={hasScrolled ? `blur(10px)` : "none"}
			zIndex={1000}
			borderBottom={"1px"}
			borderBottomColor={hasScrolled ? "alpha" : "transparent"}
			transition={"all .2s"}
		>
			<Flex w="100%" maxW={"1500px"} px={4} alignItems="center" h="100%" mx="auto" justifyContent={"space-between"}>
				<HStack spacing={5}>
					<Link to="/" alignItems={"center"} _hover={{ textDecor: "none" }} fontSize="2xl" transition={"all .2s"} transform={"auto-gpu"} _active={{ scale: 0.95 }}>
						{isBot ?
							<Text fontSize="xl" fontWeight={700}>
								Real Minecraft Server Status
							</Text>
							:
							<HStack spacing={1} alignItems={"baseline"}>
								<Text fontWeight={700}>
									IsMcServer
								</Text>
								<Badge fontSize={"md"} rounded={"md"} py={0.5} px={1.5} colorScheme="green" h="fit-content">
									.online
								</Badge>
							</HStack>
						}
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
					{!user?.prime && (
						<Button
							as={Link}
							to="/prime"
							variant={"ghost"}
							color={"brand"}
							_hover={{
								bg: "rgba(72, 0, 255, 0.1)",
								textDecoration: "none"
							}}
							_active={{
								scale: 0.9
							}}
							transform={"auto-gpu"}
							fontWeight={500}
							rightIcon={<PiCrownSimpleDuotone />}
						>
							Prime
						</Button>
					)}
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
