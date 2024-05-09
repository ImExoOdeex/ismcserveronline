import useFetcherCallback from "@/hooks/useFetcherCallback";
import NewCampaignTagsSelector from "@/layout/routes/server/panel/NewCampaignTagsSelector";
import config from "@/utils/config";
import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    Icon,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    VisuallyHiddenInput,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import { memo, useState } from "react";
import { FiEye } from "react-icons/fi";

interface Props {
    adCredits: number;
    serverId: number;
}

export default memo(function NewCampaignDrawer({ adCredits, serverId }: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const toast = useToast();
    const fetcher = useFetcherCallback((data) => {
        console.log(data);
        if (data.success) {
            toast({
                title: "Campaign created",
                description: "Your campaign has been created and will be shown to users soon",
                status: "success"
            });
            onClose();
        } else {
            toast({
                description: data.message,
                status: "error"
            });
        }
    });

    const maxViews = adCredits * config.viewsPerCredit;
    const [views, setViews] = useState(0);

    const hasAdCredits = !!adCredits;

    return (
        <>
            <Button size={"lg"} onClick={onOpen} w="min-content">
                New Campaign
            </Button>

            <Drawer
                placement={"right"}
                onClose={onClose}
                isOpen={isOpen}
                size={{
                    base: "xs",
                    md: "md"
                }}
            >
                <DrawerOverlay />
                <fetcher.Form
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4
                    }}
                    method="POST"
                >
                    <DrawerContent bg="bg">
                        <DrawerHeader borderBottomWidth="1px">Create a new campaign</DrawerHeader>
                        <DrawerBody display={"flex"} flexDir={"column"} gap={6}>
                            <Flex flexDir={"column"} gap={1}>
                                <Text fontWeight={500}>Available ad credits</Text>
                                <Text fontSize={"lg"} fontWeight={600}>
                                    {adCredits}
                                </Text>
                            </Flex>

                            <Text>
                                You can create a new campaign with the available ad credits. 1
                                credit equals 10 impressions. Your server will be shown to users
                                with same language as your server and (optionally) will be shown on
                                selected tags.
                            </Text>

                            <Divider />

                            {!hasAdCredits && (
                                <Text color="red" fontWeight={600} textAlign={"center"}>
                                    You don't have any ad credits to create a new campaign
                                </Text>
                            )}

                            <Flex flexDir={"column"} gap={2}>
                                <Flex flexDir={"column"} gap={1}>
                                    <Text fontSize={"lg"} fontWeight={600}>
                                        Views
                                    </Text>
                                    <HStack spacing={1}>
                                        <Icon as={FiEye} top="-1px" pos="relative" />
                                        <Text fontWeight={500}>
                                            {views} = {views / config.viewsPerCredit} credits
                                        </Text>
                                    </HStack>
                                </Flex>
                                <Slider
                                    isDisabled={!hasAdCredits}
                                    aria-label="slider-ex-1"
                                    value={views}
                                    onChange={(value) => setViews(value)}
                                    min={0}
                                    max={maxViews || 10}
                                    step={config.viewsPerCredit}
                                    name="views"
                                >
                                    <SliderTrack>
                                        <SliderFilledTrack bg="brand.900" />
                                    </SliderTrack>
                                    <SliderThumb bg="brand.900" />
                                </Slider>
                            </Flex>

                            <Flex flexDir={"column"} gap={2}>
                                <Flex flexDir={"column"} gap={1}>
                                    <Text fontSize={"lg"} fontWeight={600}>
                                        Tags (opitional)
                                    </Text>
                                    <Text fontWeight={500}>
                                        Select tags where you want to show your server. More tags
                                        means faster drain of views. No tags means it will show on
                                        main page or on tags page, when there's no promoted servers
                                        on that tag.
                                    </Text>
                                </Flex>
                                <NewCampaignTagsSelector hasAdCredits={hasAdCredits} />
                            </Flex>
                        </DrawerBody>

                        <DrawerFooter display={"flex"} gap={2}>
                            <Button onClick={onClose}>Cancel</Button>
                            <VisuallyHiddenInput name="serverId" value={serverId} />
                            <Button
                                isDisabled={!hasAdCredits}
                                variant="brand"
                                type="submit"
                                name="intent"
                                value="create"
                                isLoading={fetcher.state !== "idle"}
                            >
                                Create
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </fetcher.Form>
            </Drawer>
        </>
    );
});
