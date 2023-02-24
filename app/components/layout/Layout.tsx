import { Flex } from "@chakra-ui/react";
import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";

export default function Layout({ children }: { children?: React.ReactNode }) {
	return (
		<>
			<CookieConstent />
			<Header />
			<Flex flexDir={"column"} w="100%" minH={"calc(100vh - 121px)"}>
				{children}
			</Flex>
			<Footer />
		</>
	);
}
