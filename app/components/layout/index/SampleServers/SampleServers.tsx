import { Flex, Grid, GridItem, HStack, Heading, Image, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import AddServerPopover from "./AddServerPopover";

type server = { server: string, favicon: string, bedrock: boolean }

export default function SampleServers({ setServerValue, setBedrock }: { setServerValue: (s: string) => void, setBedrock: (b: boolean) => void }) {

    const lastSampleServers = useRef({})
    const { sampleServers } = useLoaderData() ?? { sampleServers: lastSampleServers.current }
    useEffect(() => {
        if (sampleServers) lastSampleServers.current = sampleServers
    }, [sampleServers])

    return (
        <Flex p={5} rounded={"2xl"} bg={'alpha'} w="100%" flexDir={'column'} mt={20}>

            <Heading as='h1' fontSize={'lg'}>Just looking? Try out these sample servers!</Heading>

            <Flex mt={5} w='100%'>
                <Grid gridTemplateColumns={{ md: 'repeat(2, 1fr)', base: 'repeat(1, 1fr)' }} px={{ base: 0, md: 3 }} w='100%' gap={5 + " !important"}>
                    {sampleServers.map((s: server) => (
                        <GridItem key={s.server} p={3} rounded={'lg'} bg={'alpha'} transform={"auto-gpu"} transition={"all .2s"} _active={{ scale: .95, bg: "alpha200" }} _hover={{ bg: "alpha100", textDecor: 'none' }} onClick={() => { setBedrock(false); setServerValue(s.server); window.scrollTo(0, 0) }} cursor={"pointer"}>
                            <HStack spacing={5}>
                                <Image rounded={'none'} src={s.favicon} alt={s.server + "'s favicon"} width={"64px"} height={"64px"} sx={{ aspectRatio: "1/1" }} />
                                <Text fontWeight={'bold'}>{s.server}</Text>
                            </HStack>
                        </GridItem>
                    ))}
                    <AddServerPopover />
                </Grid>
            </Flex>
        </Flex>
    )
}