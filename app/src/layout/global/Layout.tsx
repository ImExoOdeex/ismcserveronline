import analytics from "@/functions/analytics";
import { useProgressBar } from "@/hooks/useProgressBar";
import Fonts from "@/layout/global/Fonts";
import { Flex } from "@chakra-ui/react";
import { useLocation } from "@remix-run/react";
import type { Transition } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";
import BackgroundUtils from "./BackgroundUtils";
import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";
import SideMenu from "./Header/mobile/SideMenu";
import { ChakraBox } from "./MotionComponents";
import ProgressBar from "./ProgressBar";
import { progressBarContext } from "./ProgressBarContext";

export const mobileMenuTransition = {
	duration: 0.5,
	ease: [0.4, 0, 0.3, 1]
} as Transition;

const progressBarConfig = {
	doneWidthDuration: 0.2,
	height: 2,
	heightDuration: 0.4,
	initialProgress: 10,
	widthDuration: 0.4,
	trickleAmount: 2.75,
	trickleTime: 175
};

export default memo(function Layout({ children }: { children?: React.ReactNode }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const isClient = useMemo(() => typeof window !== "undefined", []);

	const { progress, onHide, hasBeenStarted, start, done, startAndDone } = useProgressBar({
		initialProgress: progressBarConfig.initialProgress,
		trickleTime: progressBarConfig.trickleTime,
		trickleAmount: progressBarConfig.trickleAmount
	});

	return (
		<progressBarContext.Provider
			value={{
				start,
				done,
				startAndDone
			}}
		>
			{/* not rendering only on clinet, since I dont use `hydrateRoot`, but normal `hydrate` from react 17 and it wouldn't just load if properry. just see yourself. */}
			<ProgressBar {...progressBarConfig} onHide={onHide} progress={progress} hasBeenStarted={hasBeenStarted} />

			<Inside isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}>
				{children}
			</Inside>

			<CookieConstent />

			{isClient && <SideMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />}
		</progressBarContext.Provider>
	);
});

const Inside = memo(function Inside({
	isMenuOpen,
	setIsMenuOpen,
	children
}: {
	isMenuOpen: boolean;
	setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
	children: React.ReactNode;
}) {
	const path = useLocation().pathname;

	useEffect(() => {
		analytics.pageView();
	}, [path]);

	return (
		<ChakraBox
			animate={{
				x: isMenuOpen ? "-80vw" : 0
			}}
			transition={mobileMenuTransition as Transition as any}
			display={"flex"}
			flexDir={"column"}
			h="100%"
			w="100%"
		>
			<Fonts />
			<BackgroundUtils />

			<Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
			<Flex w="100%" minH={"calc(100vh - 69px)"} flex={1} flexDir={"column"} pos="relative">
				{children}
			</Flex>
			<Footer />
		</ChakraBox>
	);
});
