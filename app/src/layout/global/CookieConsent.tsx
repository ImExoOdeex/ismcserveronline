import useRootData from "@/hooks/useRootData";
import config from "@/utils/config";
import { Button, Text } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { memo, useCallback, useState } from "react";
import { ChakraBox } from "./MotionComponents";

export default memo(function CookieConsent() {
  const { cookieConsent } = useRootData();

  const [isCookieConsent, setIsCookieConsent] = useState(!!cookieConsent);

  const accept = useCallback(() => {
    document.cookie = `cookie-consent=true; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
    setIsCookieConsent(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!isCookieConsent && (
        <ChakraBox
          exit={{
            scale: 0.9,
            opacity: 0,
            transition: { ease: config.ease, duration: 0.3 },
          }}
          backdropFilter={"blur(20px)"}
          maxW={"400px"}
          display={"flex"}
          pos={"fixed"}
          bottom={5}
          right={5}
          left={{
            base: "5",
            md: "auto",
          }}
          zIndex={10000}
          fontWeight={"500"}
          rounded={"lg"}
          border={"1px solid"}
          borderColor={"alpha300"}
          flexDir={"column"}
          p={5}
          gap={4}
        >
          <Text alignItems={"center"}>
            This site uses third-party cookies. If you don't agree using them,
            you should close this page now.
          </Text>

          <Button
            onClick={accept}
            fontStyle={"normal"}
            variant={"brand"}
            rounded={"md"}
            w="100%"
          >
            <Text mx={5}>Accept</Text>
          </Button>
        </ChakraBox>
      )}
    </AnimatePresence>
  );
});
