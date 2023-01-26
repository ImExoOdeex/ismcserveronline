import CookieConstent from "./CookieConsent";
import Footer from "./Footer";
import Header from "./Header/Header";

export default function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <>
            <CookieConstent />
            <Header />
            {children}
            <Footer />
        </>
    )
}