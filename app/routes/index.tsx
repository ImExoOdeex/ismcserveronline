import { Flex, Heading, Stack, chakra, VStack, FormLabel, HStack, Text, Switch, Button, VisuallyHiddenInput, Box } from "@chakra-ui/react";
import { type ActionArgs, redirect } from "@remix-run/node"
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





export default function Index() {

  const fetcher = useFetcher()
  const data = fetcher.data
  console.log(data);
  const [bedrockChecked, setBedrockChecked] = useState(false)
  const [searching, setSearching] = useState<boolean>(false)
  const [serverValue, setServerValue] = useState<string>()

  const variants = {
    closed: {
      width: "100%"
    },
    open: {
      width: "75%"
    }
  }

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
              <FormLabel fontSize={'12px'} color='textSec' fontWeight={400} ml={2}>Which server do you want to check?</FormLabel>

              <Flex pos={'relative'} w={{ base: "100%", sm: '75%' }} flexDir='row'>
                <ChakraInput rounded={'2xl'} placeholder="Hypixel.net" name="server" pl='14px'
                  onFocus={() => setSearching(true)} onBlur={() => setSearching(false)}
                  onChange={(e) => setServerValue(e.currentTarget.value)}
                  bg='alpha100' _focus={{ outlineColor: 'transparent', borderColor: 'brand', outlineWidth: 0 }} color='textSec' fontWeight={500}
                  h={'40px'}
                  variants={variants}
                  animate={searching || serverValue?.length ? "open" : "closed"}
                  // @ts-ignore
                  transition={{ duration: .2, ease: [0.25, 0.1, 0.25, 1] }}
                />

                <Box pos={'absolute'} right={-2} top={0} bottom={0}>
                  <AnimatePresence mode="wait">
                    {(searching || serverValue?.length) &&
                      <motion.div
                        transition={{ duration: .33, ease: [0.25, 0.1, 0.25, 1] }}
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 80, transition: { duration: .15 } }}
                      >
                        <Button rounded={'2xl'} variant='brand' ml={2} type='submit'>
                          <Text px={2}>
                            Search
                          </Text>
                        </Button>
                      </motion.div>
                    }
                  </AnimatePresence>
                </Box>


              </Flex>

              <HStack mt={1} fontSize='sm'>
                <Text minW={'37px'} fontWeight={bedrockChecked ? 500 : 600} transition='.3s' onClick={() => setBedrockChecked(false)} cursor='pointer' userSelect={'none'}>Java</Text>
                <Switch size={'sm'} colorScheme='brand'
                  onChange={(e) => setBedrockChecked(e.currentTarget.checked)} isChecked={bedrockChecked}
                />
                <Text minW={'57px'} fontWeight={bedrockChecked ? 600 : 500} transition='.3s' onClick={() => setBedrockChecked(true)} cursor='pointer' userSelect={'none'}>Bedrock</Text>
              </HStack>
            </Flex>
            <VisuallyHiddenInput name="bedrock" defaultValue={bedrockChecked ? "true" : "false"} value={bedrockChecked ? "true" : "false"} />
          </fetcher.Form>

        </VStack>

        <Flex w={{ base: '100%', md: '50%' }}>

        </Flex>
      </Stack>

    </Flex>
  );
}
