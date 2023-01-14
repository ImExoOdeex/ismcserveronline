import { Box } from "@chakra-ui/react";
import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";

export default function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <>
            <Box pos={'sticky'} top={0} zIndex={1}
            //  backdropFilter={'blur(12px)'}
            >
                <CookieConstent />
            </Box>
            <Header />
            {children}
            <Footer />
        </>
    )
}