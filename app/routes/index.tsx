import { Flex, Heading, Stack, chakra, VStack, FormLabel, HStack, Text, Button, VisuallyHiddenInput, Box, Spinner, Image, Tooltip } from "@chakra-ui/react";
import { type ActionArgs, redirect, type MetaFunction, json } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChakraBox, ChakraInput } from "~/components/layout/MotionComponents";
import { VersionChangeComp } from "~/components/layout/index/VersionChangeComp";
import type { LoaderArgs } from "@remix-run/node"
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import BotInfo from "~/components/layout/index/BotInfo";
import HowToUse from "~/components/layout/index/HowToUse";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const bedrock = formData.get("bedrock")
  const server = formData.get("server")

  return redirect(`/${bedrock == "true" ? "bedrock/" : ""}${server}`)
};


export const meta: MetaFunction = () => {
  return {
    title: "Minecraft server status | IsMcServer.online"
  };
};


export async function loader({ request }: LoaderArgs) {

  const cookies = request.headers.get("Cookie")
  const bedrock = getCookieWithoutDocument("bedrock", cookies ?? "")

  return json({ bedrock: bedrock == "true" ? true : false })
};

export default function Index() {

  const fetcher = useFetcher()

  const lastBedrock = useRef({})

  const { bedrock } = useLoaderData<typeof loader>() ?? { bedrock: lastBedrock.current }

  useEffect(() => {
    if (bedrock) lastBedrock.current = bedrock
  }, [bedrock])

  const [bedrockChecked, setBedrockChecked] = useState<boolean>(bedrock ? bedrock : false)
  const [searching, setSearching] = useState<boolean>(false)
  const [serverValue, setServerValue] = useState<string>()

  useEffect(() => {
    document.cookie = `bedrock=${bedrockChecked}`
  }, [bedrockChecked])

  const variants = {
    closed: {
      width: "100%"
    },
    open: {
      width: "70%"
    }
  }

  const submitting = fetcher.state !== 'idle'

  return (
    <Flex flexDir={'column'} maxW='1200px' mx='auto' w='100%' mt={'75px'} px='4'>

      <Stack spacing={10} direction={{ base: 'column', md: 'row' }}>

        <VStack spacing={'50px'} w={{ base: '100%', md: '50%' }} mt={'50px'} flexDir='column'>
          <Heading as={'h1'} fontSize='3xl'>
            <chakra.span color={'orange'}>
              Real
            </chakra.span>
            -time
            <chakra.span color={'green'}>
              {" "}Minecraft{" "}
            </chakra.span>
            server
            <chakra.span color={'pink.400'}>
              {" "}status{" "}
            </chakra.span>
            and
            <chakra.span color={'purple.500'}>
              {" "}data{" "}
            </chakra.span>
            checker
          </Heading>

          <fetcher.Form style={{ width: '100%' }} method='post'>
            <Flex w='100%' flexDir={'column'}>
              <FormLabel ml='14px' fontSize={'12px'} color='textSec' fontWeight={400} mb={1.5}>Which server do you want to check?</FormLabel>

              <Flex pos={'relative'} w={{ base: "100%", sm: '75%' }} flexDir='row'>
                <Flex flexDir={'column'} w='100%'>
                  <ChakraInput rounded={'2xl'} placeholder="Hypixel.net" name="server" pl='14px' w='100%'
                    onFocus={() => setSearching(true)} onBlur={() => setSearching(false)}
                    onChange={(e) => setServerValue(e.currentTarget.value)}
                    bg='alpha100' color='textSec' fontWeight={500} borderBottomRadius={0}

                    _focus={{ outlineColor: 'brand', borderColor: "brand" }}
                    outlineColor='brand' borderColor="brand"

                    h={'40px'}
                    variants={variants}
                    animate={searching || serverValue?.length ? "open" : "closed"}
                    // @ts-ignore
                    transition={{ duration: .2, ease: [0.25, 0.1, 0.25, 1] }}
                  />

                  <ChakraBox borderBottomRadius={"2xl"} h='40px' bg='alpha' outlineOffset={"2px"} outlineColor={"inv"} w='100%' pos={'relative'}
                    variants={variants} zIndex={0}
                    animate={searching || serverValue?.length ? "open" : "closed"}
                    // @ts-ignore
                    transition={{ duration: .2, ease: [0.25, 0.1, 0.25, 1] }}>

                    <HStack w='100%' h='100%'>
                      <Button w='50%' variant={'unstyled'} h='100%' pos={'relative'} onClick={() => setBedrockChecked(false)}>
                        <Text zIndex={4} color={bedrockChecked ? "initial" : "inv"} transition={"color .15s"}>
                          Java
                        </Text>
                        {!bedrockChecked &&
                          <VersionChangeComp />
                        }
                      </Button>
                      <Button w='50%' variant={'unstyled'} h='100%' pos={'relative'} onClick={() => setBedrockChecked(true)}>
                        <Text zIndex={4} color={bedrockChecked ? "inv" : "initial"} transition={"color .15s"}>
                          Bedrock
                        </Text>
                        {bedrockChecked &&
                          <VersionChangeComp />
                        }
                      </Button>
                    </HStack>

                  </ChakraBox>
                </Flex>

                <Box pos={'absolute'} right={{ base: -1, md: 2 }} top={0} bottom={0}>
                  <AnimatePresence mode="wait">
                    {(searching || serverValue?.length) &&
                      <motion.div
                        style={{ width: "100%" }}
                        transition={{ duration: .33, ease: [0.25, 0.1, 0.25, 1] }}
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 80, transition: { duration: .15 } }}
                      >
                        <Tooltip hasArrow label={`Please Enter valid server address`} isDisabled={serverValue?.includes(".")}>
                          <Button rounded={'2xl'} variant='brand' type='submit' w='100%' disabled={!serverValue?.includes(".")}>
                            <Text px={2}>
                              Search
                            </Text>
                          </Button>
                        </Tooltip>
                      </motion.div>
                    }
                  </AnimatePresence>
                </Box>

                <AnimatePresence mode="wait">
                  {submitting &&
                    <motion.div
                      style={{ position: 'absolute', top: "0", right: "0", left: "0", bottom: "0" }}
                      transition={{ duration: .33, ease: [0.25, 0.1, 0.25, 1] }}
                      initial={{ opacity: 0, y: "-25%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "-25%" }}
                    >
                      <Flex w='100%' h='100%' bg='bg' align={'center'} alignItems='center' justifyContent={'center'}>
                        <HStack>
                          <Text fontWeight={500}>
                            Getting real-time data about {serverValue}
                          </Text>
                          <Spinner size={'sm'} />
                        </HStack>
                      </Flex>
                    </motion.div>
                  }
                </AnimatePresence>


              </Flex>

            </Flex>
            <VisuallyHiddenInput name="bedrock" defaultValue={bedrockChecked ? "true" : "false"} value={bedrockChecked ? "true" : "false"} />
          </fetcher.Form>

          <Text fontWeight={600} color='textSec' maxW={'423px'} alignSelf='start'>
            Get information about your favourite Minecraft server for Java or Bedrock edition!
          </Text>

        </VStack>

        <Flex w={{ base: '100%', md: '50%' }}>
          <Image src="/ismcserveronlineimg.png" alt="image" sx={{ imageRendering: 'pixelated', aspectRatio: "4/3" }} />
        </Flex>

      </Stack>

      <BotInfo />

      <HowToUse />

    </Flex>
  );
}
