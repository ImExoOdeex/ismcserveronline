import useFetcherCallback from "@/hooks/useFetcherCallback";
import { CopyIcon } from "@chakra-ui/icons";
import {
    Button,
    Flex,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    OrderedList,
    Text,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import { memo, useEffect, useState } from "react";

interface Props {
    server: string;
    bedrock: boolean;
}

export default memo(function VerifyModal({ server, bedrock }: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [isVerifying, setIsVerifying] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const toast = useToast();
    const startFetcher = useFetcherCallback((data) => {
        if (data.success) {
            setCode(data.code);
            setIsVerifying(true);
        } else {
            setError(data.message);
        }
    });

    const checkFetcher = useFetcherCallback((data) => {
        if (!data.success) {
            setError(data.message);
        }
    });

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get("verify") === "") {
            onOpen();
        }
    }, [onOpen]);

    return (
        <>
            <Button onClick={onOpen} px={6}>
                Your server?
            </Button>
            <Modal isCentered isOpen={isOpen} onClose={onClose} size={"xl"}>
                <ModalOverlay />
                <ModalContent bg="bg">
                    <ModalHeader>Verify {server}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={"flex"} flexDir={"column"} gap={4}>
                        {!isVerifying && (
                            <>
                                <Text>
                                    To verify the server, you need to change the server's MOTD to
                                    the generated code. You need to have that verification code in
                                    the server's MOTD only for verification process. Whenever you
                                    are ready to verify the server, simply click "Start
                                    Verification" and the steps will be shown to you.
                                </Text>
                            </>
                        )}
                        {isVerifying && (
                            <>
                                <Text>To change the MOTD, do the following steps:</Text>
                                <OrderedList>
                                    <ListItem>
                                        Locate the server.properties file in your server directory.
                                    </ListItem>
                                    <ListItem>Open the file using a text editor.</ListItem>
                                    <ListItem>
                                        Replace the text after "motd=" with generated code.
                                    </ListItem>
                                    <ListItem>Save the file and restart your server.</ListItem>
                                </OrderedList>
                                <Text>
                                    After you've done these steps, make sure verification code is in
                                    the server's MOTD. If you are ready, simply click "Check" and we
                                    will verify the server for you.
                                </Text>

                                <Flex flexDir={"column"} gap={2} w="100%">
                                    <Text fontWeight={600} fontSize={"xl"} textAlign={"center"}>
                                        Verification code
                                    </Text>
                                    <InputGroup>
                                        <Input pr="4.5rem" readOnly value={code} />
                                        <InputRightElement>
                                            <IconButton
                                                size={"sm"}
                                                variant={"ghost"}
                                                aria-label="Copy to clipboard"
                                                icon={<CopyIcon boxSize={5} />}
                                                onClick={async () => {
                                                    await navigator.clipboard
                                                        .writeText(code)
                                                        .catch(() => {
                                                            toast({
                                                                title: "Failed to copy to clipboard",
                                                                status: "error"
                                                            });
                                                        });
                                                    toast({
                                                        title: "Copied to clipboard",
                                                        status: "success"
                                                    });
                                                }}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </Flex>
                            </>
                        )}
                    </ModalBody>
                    {/* <Divider /> */}
                    <ModalFooter
                        w="100%"
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                    >
                        {/* placing Flex here, cause with no element, form would go left */}
                        <Flex>
                            {error && (
                                <Text color={"red"} fontWeight={600}>
                                    {error}
                                </Text>
                            )}
                        </Flex>
                        {!isVerifying && (
                            <startFetcher.Form
                                method={"POST"}
                                action={`/api/${server}/verification${bedrock ? "?bedrock" : ""}`}
                            >
                                <Button
                                    variant={"brand"}
                                    name="intent"
                                    value={"start"}
                                    type="submit"
                                    isLoading={startFetcher.state !== "idle"}
                                >
                                    Start Verification
                                </Button>
                            </startFetcher.Form>
                        )}
                        {isVerifying && (
                            <checkFetcher.Form
                                method={"POST"}
                                action={`/api/${server}/verification${bedrock ? "?bedrock" : ""}`}
                            >
                                <Button
                                    variant={"brand"}
                                    name="intent"
                                    value={"check"}
                                    type="submit"
                                    isLoading={checkFetcher.state !== "idle"}
                                >
                                    Check
                                </Button>
                            </checkFetcher.Form>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
});
