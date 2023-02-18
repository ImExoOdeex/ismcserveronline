import { Badge, Divider, Flex, GridItem, HStack, Icon, Link, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, VStack } from "@chakra-ui/react";
import links from "../../../config/links.json"

export default function AddServerPopover() {
    return (
        <>
            <Popover isLazy placement="top">
                <PopoverTrigger>
                    <GridItem role="note" aria-label="Add server popover" aria-labelledby="Add server popover" p={3 + " !important"} userSelect={"none"} rounded={'lg'} bg={'alpha'} color={"textSec"} transform={"auto-gpu"} transition={"all .2s"} _active={{ scale: .95, bg: "alpha200" }} _hover={{ bg: "alpha100", textDecor: 'none' }} cursor={"pointer"}>
                        <HStack spacing={5}>
                            <Flex border={"2px dashed"} rounded={"md"} width={"64px"} height={"64px"} sx={{ aspectRatio: "1/1" }} />
                            <Text fontWeight={'bold'} color={"text"}>Your.server.com! Add it in a couple of seconds!</Text>
                        </HStack>
                    </GridItem>
                </PopoverTrigger>
                <PopoverContent bg="bg" outlineColor={"transparent"} w={96}>
                    <PopoverArrow bg="bg" />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight={"bold"} borderBottom={0}>Add your server there!</PopoverHeader>
                    <PopoverBody>
                        <VStack spacing={4}>
                            <Text>
                                If you want to add your server please join our discord server and take a look for a <Badge>#add-server</Badge> channel!
                            </Text>

                            <Divider my={2} />

                            <Flex w='100%'>
                                <Link href={links.discordServerInvite} bg="discord.100" _hover={{ bg: "discord.900" }} color={"white"} w='100%' mb={2} rounded={"lg"} alignItems={'center'} justifyContent={'center'} display={"flex"} py={2} fontWeight={600}>
                                    <HStack>
                                        <Icon h={'24px'} fill={"white"}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36"><defs><style>.cls-1{"fill:#fff"}</style></defs><g id="图层_2" data-name="图层 2"><g id="Discord_Logos" data-name="Discord Logos"><g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White"><path className="cls-1" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></g></g></g></svg>
                                        </Icon>
                                        <Text>
                                            Join server
                                        </Text>
                                    </HStack>
                                </Link>
                            </Flex>
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Popover>

        </>
    )
}