import { Box, Flex } from "@chakra-ui/react";
import loadable from "@loadable/component";
import type { Transition } from "framer-motion";
import { Component, useState, type ReactNode } from "react";
import useFireworks from "../utils/func/hooks/useFireworks";
import BackgroundUtils from "./BackgroundUtils";
import Column from "./Column";
import CookieConstent from "./CookieConsent";
import Header from "./Header/Header";
import SideMenu from "./Header/Mobile/SideMenu";
import { ChakraBox } from "./MotionComponents";

const Footer = loadable(() => import("./Footer"), {
	ssr: true,
	fallback: <Box minH={"172px"} h="100%" />
});

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: isLazyLoadError(error) };
	}

	componentDidCatch(error: Error) {
		if (isLazyLoadError(error)) {
			console.warn("Lazy loading failed lmao? brave? ur shield? are you ok? why are you blocking only cookie consent?");
		}
	}

	render() {
		if (this.state.hasError) {
			return;
		}

		return this.props.children;
	}
}

function isLazyLoadError(error: Error): boolean {
	return error.message.includes("dynamically");
}

export default function Layout({ children }: { children?: React.ReactNode }) {
	const mobileMenuTransition = {
		duration: 0.5,
		ease: [0.4, 0, 0.3, 1]
	} as Transition;

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useFireworks();

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

				<ErrorBoundary>
					<CookieConstent />
				</ErrorBoundary>
				<Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
				<Flex w="100%" minH={"calc(100vh - 121px)"}>
					<Column />

					<Flex flexDir={"column"} w="100%">
						{children}
					</Flex>

					<Column />
				</Flex>
				<Footer />
			</ChakraBox>
			<SideMenu mobileMenuTransition={mobileMenuTransition} isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
			{/* <Snowfall snowflakeCount={100} color={colorMode === "dark" ? "#fff" : brand} radius={[2, 3]} /> */}
		</>
	);
}
