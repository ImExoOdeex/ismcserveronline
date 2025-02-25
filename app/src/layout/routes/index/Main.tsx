import dynamic from "@/functions/dynamic";
import { capitalize } from "@/functions/utils";
import useRootData from "@/hooks/useRootData";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Tag,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Suspense, useState } from "react";
import { BiSearch } from "react-icons/bi";
import type { SearchTag } from "~/routes/search";

const McModel = dynamic(() => {
  const isMobile = window.innerWidth < 1024;
  function doesSupportWebGl(): boolean {
    if (window.WebGLRenderingContext) {
      // biome-ignore lint/style/noVar: <explanation>
      // biome-ignore lint/correctness/noInnerDeclarations: <explanation>
      var canvas = document.createElement("canvas");
      // biome-ignore lint/style/noVar: <explanation>
      // biome-ignore lint/correctness/noInnerDeclarations: <explanation>
      var names = [
        "webgl2",
        "webgl",
        "experimental-webgl",
        "moz-webgl",
        "webkit-3d",
      ];
      // biome-ignore lint/style/noVar: <explanation>
      // biome-ignore lint/correctness/noInnerDeclarations: <explanation>
      var context: any = false;

      for (let i = 0; i < names.length; i++) {
        try {
          context = canvas.getContext(names[i]);
          if (context && typeof context.getParameter === "function") {
            return true;
          }
        } catch (_) {}
      }

      // WebGL is supported, but disabled
      return false;
    }

    // WebGL not supported
    return false;
  }

  const doesSupportWebGL = doesSupportWebGl();

  // dont load model on mobile
  if (isMobile || !doesSupportWebGL) {
    return import("@/layout/routes/index/three/Empty");
  }
  return import("@/layout/routes/index/three/McModel");
});

export const modelConfig = {
  model: "blahaj.glb",
  width: 1000,
  height: 1000,
};

const versions = ["java", "bedrock"] as const;

export default function Main({ tags }: { tags: SearchTag[] }) {
  const { mcEdition } = useRootData();
  const searchFetcher = useFetcher();
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const [isMobile] = useMediaQuery("(max-width: 1024px)", {
    fallback: true,
    ssr: true,
  });

  const [version, setVersion] = useState<(typeof versions)[number]>(
    (mcEdition as (typeof versions)[number] | null) || "java"
  );

  return (
    <Flex
      gap={10}
      direction={{ base: "column", md: "row" }}
      w="100%"
      justifyContent={"space-between"}
    >
      <Flex flexDir={"column"} gap={6} zIndex={1}>
        <Heading
          as={"h1"}
          size={{
            base: "xl",
            md: "3xl",
          }}
          lineHeight={"220%"}
        >
          <Box
            as="span"
            bgClip={"text"}
            bgGradient={"linear(to-r, #8167d9, #e380a4)"}
          >
            #1{" "}
          </Box>
          Minecraft server list
          <br /> &{" "}
          <Box
            pos="relative"
            as="span"
            _after={{
              content: '""',
              display: "inline-block",
              pos: "absolute",
              bottom: {
                base: "1px",
                md: "5px",
              },
              left: 0,
              right: 0,
              width: "100%",
              height: {
                base: "3px",
                md: "5px",
              },
              bg: "green.400",
            }}
          >
            real
          </Box>{" "}
          status checker
        </Heading>

        <Text as="h2" fontWeight={600} color="textSec">
          Get information about your favorite Minecraft server for Java or
          Bedrock edition!
        </Text>

        <Flex flexDir={"column"} gap={2}>
          <Flex flexDir={"column"} gap={1}>
            <HStack spacing={1}>
              {versions.map((v) => {
                return (
                  <Button
                    size="sm"
                    key={v}
                    variant={"ghost"}
                    color="brand"
                    onClick={() => {
                      document.cookie = `version=${v}; path=/`;
                      setVersion(v);
                    }}
                    rounded={"lg"}
                    bg={version === v ? "rgba(98, 42, 167,0.3)" : "transparent"}
                    _hover={{
                      bg: "rgba(98, 42, 167, 0.2)",
                    }}
                    _active={{
                      bg: "rgba(98, 42, 167, 0.4)",
                    }}
                  >
                    {capitalize(v)} servers
                  </Button>
                );
              })}
            </HStack>
            <HStack w="100%" as={searchFetcher.Form} method="POST">
              <Input
                size={"lg"}
                placeholder="Enter exact server address or search by tags, description, etc."
                variant={"filled"}
                rounded={"xl"}
                name="server"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconButton
                type="submit"
                aria-label="Search"
                icon={<BiSearch />}
                size={"lg"}
                variant={"brand"}
                isLoading={searchFetcher.state !== "idle"}
              />
            </HStack>
          </Flex>

          <HStack overflow={"auto"}>
            {tags.map((tag) => (
              <Tag
                minW={"fit-content"}
                size={"lg"}
                onClick={() => {
                  navigate(`/search?tag=${tag.name}`);
                }}
                cursor={"pointer"}
                key={tag.name}
              >
                {tag.name}
              </Tag>
            ))}
          </HStack>
        </Flex>
      </Flex>

      {!isMobile && (
        <Flex flex={1} pos="relative">
          <Flex
            flex={1}
            overflow={"visible"}
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            w={modelConfig.width + "px"}
            h={modelConfig.height + "px"}
          >
            {/* biome-ignore lint/complexity/noUselessFragments: <explanation> */}
            <Suspense fallback={<></>}>
              <McModel />
            </Suspense>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
