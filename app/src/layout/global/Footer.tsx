import { getCookie } from "@/functions/cookies";
import useRootData from "@/hooks/useRootData";
import config from "@/utils/config";
import {
  Box,
  Link as ChakraLink,
  Flex,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import Link from "./Link";

export default function Footer() {
  const name = "tracking";
  const { noTrack, version } = useRootData();
  console.log(noTrack);

  const [cookieState, setCookieState] = useState<"track" | "no-track">(
    noTrack === "no-track" ? "no-track" : "track"
  );

  const toggleTracking = useCallback(() => {
    const cookie = getCookie(name);
    if (cookie === "track" || !cookie) {
      document.cookie = `${name}=no-track`;
      setCookieState("no-track");
    } else {
      document.cookie = `${name}=track`;
      setCookieState("track");
    }
  }, []);

  return (
    <Flex
      flexDir={{
        base: "column",
        md: "row",
      }}
      h={"auto"}
      as="footer"
      mt={10}
      w="100%"
      maxW="1200px"
      py={10}
      px={4}
      mx="auto"
      justifyContent={"space-between"}
      alignItems={{
        base: "center",
        md: "start",
      }}
      gap={10}
    >
      <Box>
        <VStack align={{ base: "center", md: "start" }}>
          <Flex flexDir={"row"}>
            <Text fontWeight={"bold"} fontSize="18px" fontStyle="">
              ismcserver
              <Box as="span" color={"green"}>
                .online
              </Box>
            </Text>
            <Text
              fontSize={"xs"}
              fontWeight={600}
              alignSelf={"end"}
              mb={1}
              ml={1.5}
            >
              {version}
            </Text>
          </Flex>
          <Text color={"textSec"} fontWeight="600">
            This site is{" "}
            <ChakraLink
              href="https://github.com/ImExoOdeex/ismcserveronline"
              target="_blank"
              textDecor={"underline"}
              variant={"link"}
            >
              open source
            </ChakraLink>{" "}
          </Text>
          <Text color={"textSec"} fontWeight={600}>
            Made with {"<3"} by{" "}
            <ChakraLink
              target="_blank"
              textDecor={"underline"}
              variant={"link"}
              href="https://github.com/ImExoOdeex/"
            >
              imexoodeex
            </ChakraLink>
          </Text>
        </VStack>
      </Box>

      <Stack
        direction={{
          base: "column",
          md: "row",
        }}
        spacing={{
          base: 10,
          md: 20,
        }}
        alignItems={{ base: "center", md: "start" }}
      >
        <VStack align={"start"} fontWeight="600">
          <Text fontWeight="700">Media</Text>
          <ChakraLink
            href={config.discordServerInvite}
            color={"textSec"}
            tabIndex={0}
            transition={"color .2s"}
            _hover={{ color: "text" }}
            cursor="pointer"
            isExternal
          >
            Discord server
          </ChakraLink>
          <ChakraLink
            href={config.twitter}
            color={"textSec"}
            transition={"color .2s"}
            _hover={{ color: "text" }}
            cursor="pointer"
            isExternal
          >
            Twitter / X
          </ChakraLink>
        </VStack>

        <Stack direction={"row"} spacing={{ base: "70px", md: 20 }}>
          <VStack align={"start"} fontWeight="600">
            <Text fontWeight="700">Availability</Text>
            <Text
              color={"textSec"}
              tabIndex={0}
              onClick={toggleTracking}
              transition={"color .2s"}
              _hover={{ color: "text" }}
              cursor="pointer"
              userSelect={"none"}
            >
              Turn tracking {cookieState === "no-track" ? "on" : "off"}
            </Text>
            <Text
              color={"textSec"}
              transition={"color .2s"}
              _hover={{ color: "text" }}
              cursor="pointer"
              onClick={() => window.scrollTo(0, 0)}
              userSelect={"none"}
            >
              Go to the top
            </Text>
          </VStack>

          <VStack align={"start"} fontWeight="600">
            <HStack w="100%" justifyContent={"space-between"}>
              <Text fontWeight="700">Other</Text>
            </HStack>
            <Text color={"textSec"}>
              <ChakraLink
                transition={"color .2s"}
                _hover={{ color: "text", textDecor: "none" }}
                as={Link}
                prefetch="intent"
                to={"/tos"}
              >
                Terms of service
              </ChakraLink>
            </Text>
            <Text color={"textSec"} fontWeight="600">
              Copyright © {new Date().getFullYear()}
            </Text>
          </VStack>
        </Stack>
      </Stack>
    </Flex>
  );
}
