import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header/Header";
import BackgroundUtils from "./BackgroundUtils";
import loadable from "@loadable/component";

const CookieConstent = loadable(() => import("./CookieConsent"), {
	ssr: true
});

const Footer = loadable(() => import("./Footer"), {
	ssr: true,
	fallback: <Box minH={"172px"} h="100%"></Box>
});

export default function Layout({ children }: { children?: React.ReactNode }) {
	return (
		<>
			<BackgroundUtils />
			<CookieConstent />
			<Header />
			<Flex flexDir={"column"} w="100%" minH={"calc(100vh - 121px)"}>
				{children}
			</Flex>
			<Footer />
		</>
	);
}
