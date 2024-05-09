import useFetcherCallback from "@/hooks/useFetcherCallback";
import Link from "@/layout/global/Link";
import {
    Button,
    Flex,
    HStack,
    Icon,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import { memo, useState } from "react";
import { CgArrowsExchange } from "react-icons/cg";
import type { APIVerifiedServer, loader } from "~/routes/api.verified-servers";

export default memo(function VerifiedServersListModal() {
    const [servers, setServers] = useState<APIVerifiedServer[]>([]);

    const fetcher = useFetcherCallback<typeof loader>((data) => {
        setServers(data.servers);
    });

    const { isOpen, onOpen, onClose } = useDisclosure({
        onOpen: () => {
            if (servers.length) return;

            fetcher.load("/api/verified-servers");
        }
    });

    return (
        <>
            <IconButton
                aria-label="Info"
                icon={<Icon as={CgArrowsExchange} boxSize={5} />}
                onClick={onOpen}
                variant={"ghost"}
            />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent bg="bg">
                    <ModalHeader>Your Verified Servers</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={"flex"} gap={4} flexDir={"column"}>
                        {servers.map((server) => (
                            <Flex
                                alignItems={"center"}
                                w="100%"
                                justifyContent={"space-between"}
                                key={server.server + "-modal"}
                            >
                                <HStack>
                                    <Image
                                        src={server.favicon ?? "/mc-icon.png"}
                                        alt={server.server}
                                        boxSize={16}
                                    />
                                    <Text fontSize="xl" fontWeight="bold">
                                        {server.server}
                                    </Text>
                                </HStack>

                                <Button
                                    as={Link}
                                    to={`/${server.bedrock ? "bedrock/" : ""}${
                                        server.server
                                    }/panel`}
                                    onClick={onClose}
                                >
                                    Open
                                </Button>
                            </Flex>
                        ))}
                        {fetcher.state === "loading" && (
                            <Flex w="100%" alignItems={"center"} p={4} justifyContent={"center"}>
                                <Spinner />
                            </Flex>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
});
