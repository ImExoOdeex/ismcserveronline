import { Flex } from "@chakra-ui/react";
import type { Transition } from "framer-motion";
import { memo, useMemo, useState } from "react";
import BackgroundUtils from "./BackgroundUtils";
import Column from "./Column";
import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";
import SideMenu from "./Header/Mobile/SideMenu";
import { ChakraBox } from "./MotionComponents";
import ProgressBar from "./ProgressBar";

export const mobileMenuTransition = {
	duration: 0.5,
	ease: [0.4, 0, 0.3, 1]
} as Transition;

export default memo(function Layout({ children }: { children?: React.ReactNode }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const isClient = useMemo(() => typeof window !== "undefined", []);

	return (
		<>
			{/* not rendering only on clinet, since I dont use `hydrateRoot`, but normal `hydrate` from react 17 and it wouldn't just load if properry. just see yourself. */}
			<ProgressBar />

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
				<Flex w="100%" minH={"calc(100vh - 69px)"} flex={1} justifyContent={"flex-start"}>
					<Column />

					<Flex flexDir={"column"} w="100%" flex={1}>
						{children}
					</Flex>

					<Column />
				</Flex>
				<Footer />
			</ChakraBox>

			<CookieConstent />

			{isClient && <SideMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />}
		</>
	);
});
