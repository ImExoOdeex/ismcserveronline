import Select from "@/layout/global/Select";
import DiscordIcon from "@/layout/global/icons/DiscordIcon";
import LanguageSelector from "@/layout/routes/search/LanguageSelector";
import config from "@/utils/config";
import { Flex, HStack, Link, Text } from "@chakra-ui/react";
import { useSearchParams } from "@remix-run/react";
import { memo } from "react";
import { PiFireSimpleBold, PiFlowerLotusBold, PiFlowerTulipBold } from "react-icons/pi";
import CategoryAutoComplete from "./CategoryAutoComplete";

const sortingOptions = [
    {
        label: "Hot",
        value: "hot",
        icon: PiFireSimpleBold
    },
    {
        label: "Newest",
        value: "newest",
        icon: PiFlowerLotusBold
    },
    {
        label: "Oldest",
        value: "oldest",
        icon: PiFlowerTulipBold
    }
];

interface Props {
    locale: string;
}

export default memo(function SideFilters({ locale }: Props) {
    const [searchParams, setSearchParams] = useSearchParams();

    return (
        <Flex flexDir={"column"} w={{ base: "100%", md: "calc(25% - 16px)" }} gap={10}>
            <Flex flexDir={"column"} gap={2}>
                <Link
                    isExternal
                    href={config.discordServerInvite}
                    fontSize={"xl"}
                    fontWeight={500}
                    color={"textSec"}
                >
                    <HStack spacing={3}>
                        <DiscordIcon fill="text" boxSize={6} />
                        <Text>Join our Discord Server</Text>
                    </HStack>
                </Link>
            </Flex>

            <Flex flexDir={"column"} gap={2}>
                <Text fontSize={"xl"} fontWeight={500} color={"textSec"}>
                    Tags
                </Text>
                <CategoryAutoComplete />
            </Flex>

            <Flex flexDir={"column"} gap={2}>
                <Text fontSize={"xl"} fontWeight={500} color={"textSec"}>
                    Sorting
                </Text>
                <Select
                    options={sortingOptions}
                    defaultValue={
                        sortingOptions.find(
                            (option) => option.value === searchParams.get("sort")
                        ) ?? sortingOptions[0]
                    }
                    onChange={(option: any) => {
                        setSearchParams((prev) => {
                            if (option?.value === "hot") {
                                prev.delete("sort");
                            } else {
                                prev.set("sort", option!.value);
                            }

                            return prev;
                        });
                    }}
                />
            </Flex>

            <Flex flexDir={"column"} gap={2}>
                <Text fontSize={"xl"} fontWeight={500} color={"textSec"}>
                    Language
                </Text>
                <LanguageSelector locale={locale} />
            </Flex>
        </Flex>
    );
});
