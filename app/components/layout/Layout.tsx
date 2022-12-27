import { Box } from "@chakra-ui/react";
import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";
import Snowfall from "react-snowfall";

export default function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <>
            <Snowfall style={{ zIndex: -2 }} snowflakeCount={50} speed={[1, 4]} wind={[-1, 1]} />
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