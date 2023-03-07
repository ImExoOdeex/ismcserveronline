import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header/Header";
import BackgroundUtils from "./BackgroundUtils";
import loadable from "@loadable/component";
import { useAdBlock } from "../utils/func/hooks/useAdBlock";
import { adType, Ad } from "../ads/Ad";

const CookieConstent = loadable(() => import("./CookieConsent"), {
	ssr: true
});

const Footer = loadable(() => import("./Footer"), {
	ssr: true,
	fallback: <Box minH={"172px"} h="100%" />
});

const AdblockDetected = loadable(() => import("../ads/AdblockDetected"), {
	ssr: true
});

export default function Layout({ children }: { children?: React.ReactNode }) {
	const adBlockDetected = useAdBlock();

	return (
		<>
			<BackgroundUtils />
			{adBlockDetected && <AdblockDetected />}
			<CookieConstent />
			<Header />
			<Flex flexDir={"column"} w="100%" minH={"calc(100vh - 121px)"}>
				<Ad type={adType.small} />
				{children}
			</Flex>
			<Footer />
		</>
	);
}
