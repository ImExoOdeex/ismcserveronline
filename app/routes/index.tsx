import { Flex, Heading, Stack, chakra, VStack, FormLabel, HStack, Text, Switch, Button, VisuallyHiddenInput, Box, Spinner, Divider, Image } from "@chakra-ui/react";
import { type ActionArgs, redirect, type MetaFunction } from "@remix-run/node"
import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChakraInput } from "~/components/layout/MotionComponents";




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


export default function Index() {

  const fetcher = useFetcher()

  const [bedrockChecked, setBedrockChecked] = useState<boolean>(false)
  const [searching, setSearching] = useState<boolean>(false)
  const [serverValue, setServerValue] = useState<string>()

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
    <Flex flexDir={'column'} maxW='1200px' mx='auto' w='100%' mt={'50px'} px='4'>

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
                <ChakraInput rounded={'2xl'} placeholder="Hypixel.net" name="server" pl='14px' w='100%'
                  onFocus={() => setSearching(true)} onBlur={() => setSearching(false)}
                  onChange={(e) => setServerValue(e.currentTarget.value)}
                  bg='alpha100' _focus={{ outlineColor: 'transparent', borderColor: 'brand', outlineWidth: 0 }} color='textSec' fontWeight={500}
                  h={'40px'}
                  variants={variants}
                  animate={searching || serverValue?.length ? "open" : "closed"}
                  // @ts-ignore
                  transition={{ duration: .2, ease: [0.25, 0.1, 0.25, 1] }}
                />

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
                        <Button rounded={'2xl'} variant='brand' type='submit' w='100%'>
                          <Text px={2}>
                            Search
                          </Text>
                        </Button>
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
                      <Flex w='110%' h='100%' bg='bg' align={'center'} alignItems='center' justifyContent={'center'}>
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

              <Divider my={1.5} w='75%' />

              <HStack fontSize='12px' pl='14px'>
                <Text fontWeight={bedrockChecked ? 500 : 600} transition='.3s' onClick={() => setBedrockChecked(false)} cursor='pointer' userSelect={'none'}>Java</Text>
                <Switch size={'sm'} colorScheme='brand'
                  onChange={(e) => setBedrockChecked(e.currentTarget.checked)} isChecked={bedrockChecked}
                />
                <Text fontWeight={bedrockChecked ? 600 : 500} transition='.3s' onClick={() => setBedrockChecked(true)} cursor='pointer' userSelect={'none'}>Bedrock</Text>
              </HStack>
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

      <Divider my='80px' />

      <VStack spacing={'50px'} >
        <VStack spacing={5} maxW='600px'>
          <Heading fontSize={'2xl'}>About this app</Heading>
          <Text fontWeight={600} textAlign='center'>This app was created to help people with most primary problem - they can't connect so some Minecraft server, so first thing they do is check is Minecraft server down.</Text>
        </VStack>
      </VStack>

    </Flex>
  );
}
