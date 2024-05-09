import type { DiscordMessage } from "@/layout/routes/dashboard/bot/editor/DiscordMessageEditor";
import config from "@/utils/config";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Text,
    Textarea
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface Props {
    message: DiscordMessage;
    setMessage: React.Dispatch<React.SetStateAction<DiscordMessage>>;
}

export default function MessageEditor({ message, setMessage }: Props) {
    const [opens, setOpens] = useState({
        author: false,
        body: false,
        fields: false,
        images: false,
        footer: false
    });

    return (
        <Flex
            w={{
                base: "100%",
                md: "50%"
            }}
            flexDir={"column"}
            gap={4}
        >
            <Heading fontWeight={600} fontSize={"lg"}>
                Content
            </Heading>

            <Textarea
                bg={"alpha"}
                value={message.content}
                variant={"filled"}
                onChange={(e) => setMessage((prev) => ({ ...prev, content: e.target.value }))}
                name="content"
            />

            {/* Embed */}
            <Flex flexDir={"column"} w="100%" gap={2}>
                <Heading fontSize={"lg"} fontWeight={600}>
                    Embed
                </Heading>

                {/* Author */}
                <Flex flexDir={"column"} w="100%">
                    <Button
                        _active={{
                            bg: "transparent"
                        }}
                        variant={"unstyled"}
                        display={"flex"}
                        alignItems={"center"}
                        gap={2}
                        justifyContent={"space-between"}
                        onClick={() =>
                            setOpens((prev) => ({
                                ...prev,
                                author: !prev.author
                            }))
                        }
                    >
                        <Text fontWeight={600}>Author</Text>
                        <ChevronDownIcon
                            transform={"auto-gpu"}
                            rotate={opens.author ? "180deg" : "0deg"}
                            transition={`transform 0.2s cubic-bezier(${config.ease.join(", ")})`}
                        />
                    </Button>

                    <FieldsEditor isOpen={opens.author}>
                        <FormControl>
                            <FormLabel>Author</FormLabel>
                            <Input
                                variant={"filled"}
                                placeholder={"Author"}
                                value={message.embed?.author?.name || ""}
                                onChange={(e) =>
                                    setMessage((prev) => ({
                                        ...prev,
                                        embed: {
                                            ...message.embed,
                                            author: {
                                                ...message.embed?.author,
                                                name: e.target.value
                                            }
                                        }
                                    }))
                                }
                                name="authorName"
                            />
                        </FormControl>
                        <Flex
                            flexDir={{
                                base: "column",
                                md: "row"
                            }}
                            gap={2}
                        >
                            <FormControl>
                                <FormLabel>Author URL</FormLabel>
                                <Input
                                    variant={"filled"}
                                    placeholder="Author URL"
                                    value={message.embed?.author?.url || ""}
                                    onChange={(e) => {
                                        setMessage((prev) => ({
                                            ...prev,
                                            embed: {
                                                ...prev.embed,
                                                author: {
                                                    ...prev.embed.author,
                                                    url: e.target.value
                                                }
                                            }
                                        }));
                                    }}
                                    name="authorURL"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Author Icon URL</FormLabel>
                                <Input
                                    variant={"filled"}
                                    placeholder="Author Icon URL"
                                    value={message.embed?.author?.icon_url || ""}
                                    onChange={(e) => {
                                        setMessage((prev) => ({
                                            ...prev,
                                            embed: {
                                                ...prev.embed,
                                                author: {
                                                    ...prev.embed.author,
                                                    icon_url: e.target.value
                                                }
                                            }
                                        }));
                                    }}
                                    name="authorIconURL"
                                />
                            </FormControl>
                        </Flex>
                    </FieldsEditor>

                    <Divider />
                </Flex>

                {/* Body */}
                <Flex flexDir={"column"} w="100%">
                    <Button
                        _active={{
                            bg: "transparent"
                        }}
                        variant={"unstyled"}
                        display={"flex"}
                        alignItems={"center"}
                        gap={2}
                        justifyContent={"space-between"}
                        onClick={() =>
                            setOpens((prev) => ({
                                ...prev,
                                body: !prev.body
                            }))
                        }
                    >
                        <Text fontWeight={600}>Body</Text>
                        <ChevronDownIcon
                            transform={"auto-gpu"}
                            rotate={opens.body ? "180deg" : "0deg"}
                            transition={`transform 0.2s ${config.cubicEase}`}
                        />
                    </Button>

                    <FieldsEditor isOpen={opens.body}>
                        <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Input
                                variant={"filled"}
                                placeholder={"Author"}
                                value={message.embed?.title || ""}
                                onChange={(e) =>
                                    setMessage((prev) => ({
                                        ...prev,
                                        embed: {
                                            ...prev.embed,
                                            title: e.target.value
                                        }
                                    }))
                                }
                                name="title"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                variant={"filled"}
                                placeholder={"Description"}
                                value={message.embed?.description || ""}
                                onChange={(e) =>
                                    setMessage((prev) => ({
                                        ...prev,
                                        embed: {
                                            ...prev.embed,
                                            description: e.target.value
                                        }
                                    }))
                                }
                                name="description"
                            />
                        </FormControl>
                        <Flex
                            flexDir={{
                                base: "column",
                                md: "row"
                            }}
                            gap={2}
                        >
                            <FormControl>
                                <FormLabel>URL</FormLabel>
                                <Input
                                    variant={"filled"}
                                    placeholder="Author URL"
                                    value={message.embed?.url || ""}
                                    onChange={(e) => {
                                        setMessage((prev) => ({
                                            ...prev,
                                            embed: {
                                                ...prev.embed,
                                                url: e.target.value
                                            }
                                        }));
                                    }}
                                    name="url"
                                />
                            </FormControl>
                            {/* <FormControl>
								<FormLabel>Color</FormLabel>
								<Flex gap={2} alignItems={"center"}>
									<Input
										variant={"filled"}
										placeholder="#ffffff"
										value={message.embed?.color ? decimalToHex(message.embed.color) : ""}
										onChange={(e) => {
											startTransition(() => {
												setMessage((prev) => ({
													...prev,
													embed: {
														...prev.embed,
														color: hexToDecimal(e.target.value)
													}
												}));
											});
										}}
										name={`color`}
										id={`color`}
									/>
									<Flex
										as={"label"}
										htmlFor={`color${inputID}`}
										pos="relative"
										rounded={"lg"}
										boxSize={10}
										minW={10}
										bg={message.embed?.color ? decimalToHex(message.embed.color) : "gray.500"}
										cursor={"pointer"}
									>
										<Input
											type="color"
											id={`color${inputID}`}
											name={`color${inputID}`}
											srOnly
											pos="absolute"
											left={0}
											bottom={0}
											value={message.embed?.color ? decimalToHex(message.embed.color) : ""}
											onChange={(e) => {
												startTransition(() => {
													setMessage((prev) => ({
														...prev,
														embed: {
															...prev.embed,
															color: hexToDecimal(e.target.value)
														}
													}));
												});
											}}
										/>
									</Flex>
								</Flex>
							</FormControl> */}
                        </Flex>
                    </FieldsEditor>

                    <Divider />
                </Flex>

                {/* Fields */}
                <Flex flexDir={"column"} w="100%">
                    <Button
                        _active={{
                            bg: "transparent"
                        }}
                        variant={"unstyled"}
                        display={"flex"}
                        alignItems={"center"}
                        gap={2}
                        justifyContent={"space-between"}
                        onClick={() =>
                            setOpens((prev) => ({
                                ...prev,
                                fields: !prev.fields
                            }))
                        }
                    >
                        <Text fontWeight={600}>Fields</Text>
                        <ChevronDownIcon
                            transform={"auto-gpu"}
                            rotate={opens.fields ? "180deg" : "0deg"}
                            transition={`transform 0.2s cubic-bezier(${config.ease.join(", ")})`}
                        />
                    </Button>

                    <FieldsEditor isOpen={opens.fields}>
                        {/* fields */}
                        <Flex flexDir={"column"} gap={1}>
                            {message.embed?.fields?.map((field, i) => (
                                <Flex
                                    px={{
                                        base: 2,
                                        md: 4
                                    }}
                                    key={"field-" + i}
                                    w="100%"
                                    gap={0}
                                    py={0}
                                    rounded={"md"}
                                    bg="alpha"
                                    _hover={{
                                        bg: "alpha100"
                                    }}
                                    flexDir={"column"}
                                >
                                    <Button
                                        _active={{
                                            bg: "transparent"
                                        }}
                                        display={"flex"}
                                        w="100%"
                                        justifyContent={"space-between"}
                                        alignItems={"center"}
                                        variant={"unstyled"}
                                        onClick={() => {
                                            const fields = message.embed.fields;
                                            fields[i].isOpen = !fields[i]?.isOpen;

                                            setMessage((prev) => ({
                                                ...prev,
                                                embed: {
                                                    ...prev.embed,
                                                    fields
                                                }
                                            }));
                                        }}
                                    >
                                        <Text fontWeight={500}>{field.name}</Text>
                                        <ChevronDownIcon
                                            transform={"auto-gpu"}
                                            rotate={field.isOpen ? "180deg" : "0deg"}
                                            transition={`transform 0.2s ${config.cubicEase}`}
                                        />
                                    </Button>

                                    <FieldsEditor isOpen={!!field?.isOpen}>
                                        <FormControl>
                                            <FormLabel fontSize={"sm"}>Name</FormLabel>
                                            <Input
                                                variant={"filled"}
                                                placeholder="Name"
                                                value={field.name || ""}
                                                onChange={(e) => {
                                                    const fields = message.embed.fields;
                                                    fields[i].name = e.target.value;
                                                    setMessage((prev) => ({
                                                        ...prev,
                                                        embed: {
                                                            ...prev.embed,
                                                            fields
                                                        }
                                                    }));
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize={"sm"}>Value</FormLabel>
                                            <Input
                                                variant={"filled"}
                                                placeholder="Value"
                                                value={field?.value || ""}
                                                onChange={(e) => {
                                                    const fields = message.embed.fields;
                                                    fields[i].value = e.target.value;
                                                    setMessage((prev) => ({
                                                        ...prev,
                                                        embed: {
                                                            ...prev.embed,
                                                            fields
                                                        }
                                                    }));
                                                }}
                                            />
                                        </FormControl>

                                        <Flex gap={2}>
                                            <Button
                                                variant={field.inline ? "brand" : "solid"}
                                                w="100%"
                                                onClick={() => {
                                                    const fields = message.embed.fields;
                                                    fields[i].inline = !fields[i].inline;

                                                    setMessage((prev) => ({
                                                        ...prev,
                                                        embed: {
                                                            ...prev.embed,
                                                            fields
                                                        }
                                                    }));
                                                }}
                                            >
                                                Inline
                                            </Button>
                                            <Button
                                                w="100%"
                                                bg="red.500"
                                                color="white"
                                                onClick={() => {
                                                    const fields = message.embed.fields.filter(
                                                        (_, index) => index !== i
                                                    );

                                                    setMessage((prev) => ({
                                                        ...prev,
                                                        embed: {
                                                            ...prev.embed,
                                                            fields
                                                        }
                                                    }));
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </Flex>
                                    </FieldsEditor>
                                </Flex>
                            ))}
                        </Flex>

                        <Button
                            variant={"solid"}
                            onClick={() => {
                                setMessage((prev) => ({
                                    ...prev,
                                    embed: {
                                        ...prev.embed,
                                        fields: [
                                            ...(prev.embed?.fields || []),
                                            {
                                                name: "New Field",
                                                value: "Empty",
                                                inline: false,
                                                isOpen: false
                                            }
                                        ]
                                    }
                                }));
                            }}
                        >
                            Add Field
                        </Button>
                    </FieldsEditor>
                    <Divider />
                </Flex>

                {/* Images */}
                <Flex flexDir={"column"} w="100%">
                    <Button
                        _active={{
                            bg: "transparent"
                        }}
                        variant={"unstyled"}
                        display={"flex"}
                        alignItems={"center"}
                        gap={2}
                        justifyContent={"space-between"}
                        onClick={() =>
                            setOpens((prev) => ({
                                ...prev,
                                images: !prev.images
                            }))
                        }
                    >
                        <Text fontWeight={600}>Images</Text>
                        <ChevronDownIcon
                            transform={"auto-gpu"}
                            rotate={opens.images ? "180deg" : "0deg"}
                            transition={`transform 0.2s ${config.cubicEase}`}
                        />
                    </Button>

                    <FieldsEditor isOpen={opens.images}>
                        <FormControl>
                            <FormLabel>Image URL</FormLabel>
                            <Input
                                variant={"filled"}
                                placeholder={"Image URL"}
                                value={message.embed?.image?.url || ""}
                                onChange={(e) =>
                                    setMessage((prev) => ({
                                        ...prev,
                                        embed: {
                                            ...prev.embed,
                                            image: {
                                                ...prev.embed.image,
                                                url: e.target.value
                                            }
                                        }
                                    }))
                                }
                                name="imageUrl"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Thumbnail URL</FormLabel>
                            <Input
                                variant={"filled"}
                                placeholder={"Thumbnail URL"}
                                value={message.embed?.thumbnail?.url || ""}
                                onChange={(e) =>
                                    setMessage((prev) => ({
                                        ...prev,
                                        embed: {
                                            ...prev.embed,
                                            thumbnail: {
                                                ...prev.embed.thumbnail,
                                                url: e.target.value
                                            }
                                        }
                                    }))
                                }
                                name="thumbnailUrl"
                            />
                        </FormControl>
                    </FieldsEditor>

                    <Divider />
                </Flex>

                {/* Footer */}
                <Flex flexDir={"column"} w="100%">
                    <Button
                        _active={{
                            bg: "transparent"
                        }}
                        variant={"unstyled"}
                        display={"flex"}
                        alignItems={"center"}
                        gap={2}
                        justifyContent={"space-between"}
                        onClick={() =>
                            setOpens((prev) => ({
                                ...prev,
                                footer: !prev.footer
                            }))
                        }
                    >
                        <Text fontWeight={600}>Footer</Text>
                        <ChevronDownIcon
                            transform={"auto-gpu"}
                            rotate={opens.footer ? "180deg" : "0deg"}
                            transition={`transform 0.2s ${config.cubicEase}`}
                        />
                    </Button>

                    <FieldsEditor isOpen={opens.footer}>
                        <FormControl>
                            <FormLabel>Footer</FormLabel>
                            <Input
                                variant={"filled"}
                                placeholder={"Footer"}
                                value={message.embed?.footer?.text || ""}
                                onChange={(e) =>
                                    setMessage({
                                        ...message,
                                        embed: {
                                            ...message.embed,
                                            footer: {
                                                ...message.embed!.footer!,
                                                text: e.target.value || null
                                            }
                                        }
                                    })
                                }
                                name="footerText"
                            />
                        </FormControl>
                        <Flex
                            flexDir={{
                                base: "column",
                                md: "row"
                            }}
                            gap={2}
                        >
                            {/* <FormControl>
								<FormLabel>Timestamp</FormLabel>
								<Input
									placeholder="Timestamp"
									value={message.timestamp}
									type="datetime-local"
									onChange={(e) => {
										setMessage((prev) => ({
											...prev,
											timestamp: e.target.value
										}));
									}}
									name="timestamp"
								/>
							</FormControl> */}
                            <FormControl>
                                <FormLabel>Footer Icon URL</FormLabel>
                                <Input
                                    variant={"filled"}
                                    placeholder="Author Icon URL"
                                    value={message.embed?.footer?.icon_url || ""}
                                    onChange={(e) => {
                                        setMessage((prev) => ({
                                            ...prev,
                                            embed: {
                                                ...prev.embed,
                                                footer: {
                                                    ...prev.embed.footer!,
                                                    icon_url: e.target.value || null
                                                }
                                            }
                                        }));
                                    }}
                                    name="footerIconUrl"
                                />
                            </FormControl>
                        </Flex>
                    </FieldsEditor>

                    <Divider />
                </Flex>
            </Flex>
        </Flex>
    );
}

function FieldsEditor({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: isOpen ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: config.ease }}
                style={{
                    overflow: "hidden"
                }}
            >
                <Flex flexDir={"column"} gap={4} my={2}>
                    {children}
                </Flex>
            </motion.div>
        </AnimatePresence>
    );
}
