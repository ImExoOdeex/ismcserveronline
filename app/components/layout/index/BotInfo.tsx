import { Flex, Heading, Icon, Image, Link, Stack, Text, VStack } from "@chakra-ui/react";
import { ChakraBox } from "../MotionComponents";
import { useState } from "react";
import { motion } from "framer-motion"

export default function BotInfo() {

    const [activeBlock, setActiveBlock] = useState<number | null>()

    const variants = {
        open: {
            height: "30%"
        },
        open1: {
            height: "70%"
        },
        closed: {
            height: "50%"
        }
    }

    const [opened, setOpened] = useState<boolean>(false)

    return (
        <VStack w='100%' align={'start'} my={20} spacing={20}>

            <VStack w='100%' align={'start'} spacing={5}>

                <Flex p={5} rounded={"2xl"} bg={'alpha'} w="100%" flexDir={'column'} onClick={() => setOpened(!opened)}
                    userSelect={opened ? "all" : "none"} cursor={opened ? "initial" : "pointer"}
                >
                    <VStack align={'start'} spacing={0}>
                        <Text fontSize={'xs'}>Add our bot!</Text>
                        <Heading as={'h1'} fontSize={'lg'}>Is Minecraft Server Online</Heading>
                    </VStack>

                    <motion.div
                        variants={{ open: { height: "auto" }, closed: { height: 0 } }} animate={opened ? "open" : "closed"}
                        style={{ height: "auto", overflow: "hidden" }}
                    >
                        <Stack w='100%' maxW={'1200px'} mx='auto' spacing={5} pos={'relative'}
                            direction={{ base: "column", md: "row" }}>

                            <Image src="/statusbotlogo512.png" rounded={'2xl'} h='300px' boxShadow={'md'} border="2px solid white" />

                            <VStack w='100%' align={"start"} spacing={5}>
                                {/* bot */}
                                <ChakraBox w='100%' h='50%'
                                    variants={variants} animate={activeBlock == 0 ? "open" : activeBlock == 1 ? "open1" : "closed"}
                                    onMouseEnter={() => setActiveBlock(0)}
                                    onMouseLeave={() => setActiveBlock(null)}
                                >
                                    <Stack w='100%' py={{ base: 5, sm: 3 }} px={3} h='100%' alignItems={'center'} justifyContent={'center'} boxShadow={'lg'} transition={'.2s'}
                                        direction={{ base: "column", sm: "row" }} spacing={5} rounded={'2xl'} bg='discord.100' _hover={{ bg: "discord.900", textDecor: "none" }} transform={'auto-gpu'} _active={{ scale: .9 }}
                                        as={Link} href="https://discord.com/api/oauth2/authorize?client_id=1043569248427061380&permissions=2147789824&scope=bot"
                                    >
                                        <Icon boxSize={'48px'} fill={"white"}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36"><defs><style>.cls-1{"fill:#fff"}</style></defs><g id="图层_2" data-name="图层 2"><g id="Discord_Logos" data-name="Discord Logos"><g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White"><path className="cls-1" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></g></g></g></svg>
                                        </Icon>
                                        <Text fontWeight={700} color={"white"} textAlign={'center'}>
                                            Invite our bot to your server to check Server status directly in discord!
                                        </Text>
                                    </Stack>
                                </ChakraBox>


                                {/* server */}
                                <ChakraBox w='100%' h='50%'
                                    variants={variants} animate={activeBlock == 1 ? "open" : activeBlock == 0 ? "open1" : "closed"}
                                    onMouseEnter={() => setActiveBlock(1)}
                                    onMouseLeave={() => setActiveBlock(null)}
                                >
                                    <Stack w='100%' py={{ base: 5, sm: 3 }} px={3} h='100%' alignItems={'center'} justifyContent={'center'} boxShadow={'lg'} transition={'.2s'}
                                        direction={{ base: "column", sm: "row" }} spacing={5} rounded={'2xl'} bg='discord.900' _hover={{ bg: "discord.100", textDecor: "none" }} transform={'auto-gpu'} _active={{ scale: .9 }}
                                        as={Link} href="https://discord.gg/e2c4DgRbWN">
                                        <Icon boxSize={'48px'} fill={"white"}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36"><defs><style>.cls-1{"fill:#fff"}</style></defs><g id="图层_2" data-name="图层 2"><g id="Discord_Logos" data-name="Discord Logos"><g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White"><path className="cls-1" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></g></g></g></svg>
                                        </Icon>
                                        <Text fontWeight={700} color={"white"} textAlign={'center'}>
                                            Join our server if you need any help or just want to talk!
                                        </Text>
                                    </Stack>
                                </ChakraBox>
                            </VStack>

                        </Stack>
                    </motion.div>

                </Flex>

            </VStack>
        </VStack>
    )
}