import { Flex } from "@chakra-ui/react";
import type { Transition } from "framer-motion";
import { useState } from "react";
import BackgroundUtils from "./BackgroundUtils";
import Column from "./Column";
import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";
import SideMenu from "./Header/Mobile/SideMenu";
import { ChakraBox } from "./MotionComponents";

export default function Layout({ children }: { children?: React.ReactNode }) {
	const mobileMenuTransition = {
		duration: 0.5,
		ease: [0.4, 0, 0.3, 1]
	} as Transition;

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<>
			<ChakraBox
				animate={{
					x: isMenuOpen ? "-80vw" : 0
				}}
				transition={mobileMenuTransition as Transition as any}
				flexDir={"column"}
				h="100%"
				w="100%"
			>
				<BackgroundUtils />

				<Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
				<Flex w="100%" minH={"calc(100vh - 121px)"}>
					<Column />

					<Flex flexDir={"column"} w="100%">
						{children}
					</Flex>

					<Column />
				</Flex>
				<CookieConstent />
				<Footer />
			</ChakraBox>

			<SideMenu mobileMenuTransition={mobileMenuTransition} isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
		</>
	);
}
