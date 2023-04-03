import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header/Header";
import BackgroundUtils from "./BackgroundUtils";
import loadable from "@loadable/component";
import { useAdBlock } from "../utils/func/hooks/useAdBlock";
import Column from "./Column";
import { Component, type ReactNode } from "react";

const CookieConstent = loadable(() => import("./CookieConsent"), {
	ssr: false
});

const Footer = loadable(() => import("./Footer"), {
	ssr: true,
	fallback: <Box minH={"172px"} h="100%" />
});

const AdblockDetected = loadable(() => import("../ads/AdblockDetected"), {
	ssr: true
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
	const adBlockDetected = useAdBlock();

	return (
		<>
			<BackgroundUtils />
			{adBlockDetected && <AdblockDetected />}
			<ErrorBoundary>
				<CookieConstent />
			</ErrorBoundary>
			<Header />
			<Flex w="100%" minH={"calc(100vh - 121px)"}>
				<Column />

				<Flex flexDir={"column"} w="100%">
					{children}
				</Flex>

				<Column />
			</Flex>
			<Footer />
		</>
	);
}
