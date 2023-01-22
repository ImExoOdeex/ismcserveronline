import { CheckIcon, SmallCloseIcon } from "@chakra-ui/icons"
import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, HStack, Tfoot, Flex, Heading, Text, useColorModeValue, Badge } from "@chakra-ui/react"
import { type SOURCE } from "@prisma/client"

type Check = { id: number; server: string; source: SOURCE; online: boolean; players: number; checked_at: Date; }
type Props = {
    server: string, checks: Check[]
}

export default function ChecksTable({ server, checks }: Props) {
    const borderColor = useColorModeValue('#2f2e32', '#2f2e32 !important')

    return (
        <>
            {checks.length ?
                <TableContainer w='100%'>
                    <Table variant='simple' size={'sm'}>
                        <TableCaption>Last status checks for {server}</TableCaption>
                        <Thead>
                            <Tr sx={{ "> *": { borderColor: borderColor } }}>
                                <Th>Date</Th>
                                <Th>Status</Th>
                                <Th>Platform</Th>
                                <Th isNumeric>Players</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {checks.map((c: Check) => {
                                return (
                                    <Tr key={c.id}
                                        _hover={{ bg: 'alpha' }} transition="background .05s"
                                        sx={{ "> *": { borderColor: borderColor } }}>
                                        <Td>{new Date(c.checked_at).toLocaleString()}</Td>
                                        <Td>{c.online ?
                                            <HStack rounded={'md'} color='green' bg={'rgba(72, 187, 120, 0.1)'} w='min-content' px={3} py={1}>
                                                <Text textTransform={'none'} fontWeight={600}>Online</Text>
                                                <CheckIcon />
                                            </HStack>
                                            :
                                            <HStack rounded={'md'} color='red' bg={'rgba(187, 72, 72, 0.1)'} w='min-content' px={3} py={1}>
                                                <Text textTransform={'none'}>Offline</Text>
                                                <SmallCloseIcon />
                                            </HStack>
                                        }</Td>
                                        <Td>
                                            <Badge rounded={"md"} fontWeight={700} px={3} py={1} colorScheme={c.source == "WEB" ? "gray" : c.source == "DISCORD" ? "blue" : "blackAlpha"}>{c.source}</Badge>
                                        </Td>
                                        <Td isNumeric>{c.players}</Td>
                                    </Tr>
                                )
                            })}
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Status</Th>
                                <Th>Platform</Th>
                                <Th isNumeric>Players</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>

                :

                <Flex w="100%">
                    <Heading fontSize={'md'} justifySelf='center' textAlign='center' color={'red'} mx='auto'>
                        There were no checks
                    </Heading>
                </Flex>

            }
        </>
    )
}