import { CheckIcon } from "@chakra-ui/icons";
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorMode,
    useToast
} from "@chakra-ui/react";
import { useState } from "react";
import type Stripe from "stripe";

interface Props {
    addedCoupon: Stripe.Response<Stripe.Coupon> | null;
    setAddedCoupon: React.Dispatch<React.SetStateAction<Stripe.Response<Stripe.Coupon> | null>>;
    color: string;
    serverId: number | null;
    isServer: boolean;
}

export default function CouponForm({
    addedCoupon,
    setAddedCoupon,
    color,
    serverId,
    isServer
}: Props) {
    const toast = useToast();

    const [hidden, setHidden] = useState(true);
    const [coupon, setCoupon] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSumit() {
        setIsSubmitting(true);
        // if (coupon.length !== 8) {
        // 	toast({
        // 		title: "Invalid coupon",
        // 		status: "error",
        // 		duration: 9000,
        // 		variant: "subtle",
        // 		position: "bottom-right",
        // 		isClosable: true
        // 	});
        // 	setIsSubmitting(false);
        // 	return;
        // }

        const res = await fetch(`/api/coupon/${coupon}`, {
            method: "GET"
        }).then((res) => res.json());

        console.log(res);

        if (!res?.coupon) {
            toast({
                title: "Invalid coupon",
                status: "error",
                duration: 9000
            });
            setIsSubmitting(false);
            return;
        }

        if (!(res.coupon as Stripe.Coupon).valid) {
            toast({
                title: "Invalid coupon",
                status: "error",
                duration: 9000
            });
            setIsSubmitting(false);
            return;
        }

        if ((res.coupon as Stripe.Coupon).name?.startsWith("SERVER-")) {
            const [, id] = (res.coupon as Stripe.Coupon).name!.split("-");

            if (serverId !== Number(id)) {
                toast({
                    title: "Invalid coupon",
                    status: "error",
                    duration: 9000
                });
                setIsSubmitting(false);
                return;
            }
        }

        setAddedCoupon(res?.coupon as Stripe.Response<Stripe.Coupon>);
        setIsSubmitting(false);
    }

    const { colorMode } = useColorMode();

    return (
        <Flex flexDir={"column"} alignItems={"flex-end"} justifyContent={"flex-end"}>
            {hidden ? (
                <Button
                    variant={"unstyled"}
                    color={color}
                    onClick={() => setHidden(false)}
                    fontWeight={500}
                >
                    Have a coupon?
                </Button>
            ) : addedCoupon ? (
                <Flex
                    flexDir={"column"}
                    gap={1}
                    justifyContent={"flex-end"}
                    alignItems={"flex-end"}
                >
                    <Flex flexDir={"column"} alignItems={"flex-end"}>
                        <Text fontSize={"xs"} color={"textSec"}>
                            Percent off
                        </Text>
                        <Text fontSize={"lg"} fontWeight={"semibold"}>
                            {addedCoupon.percent_off}%
                        </Text>
                    </Flex>

                    <Flex flexDir={"column"} alignItems={"flex-end"}>
                        <Text fontSize={"xs"} color={"textSec"}>
                            Duration
                        </Text>
                        <Text fontSize={"lg"} fontWeight={"semibold"}>
                            {addedCoupon.duration === "forever"
                                ? "Forever"
                                : addedCoupon.duration_in_months + " months"}
                        </Text>
                    </Flex>
                </Flex>
            ) : (
                <FormControl maxW={"300px"}>
                    <FormLabel>Coupon code</FormLabel>
                    <InputGroup>
                        <Input
                            variant={"filled"}
                            placeholder="Enter coupon"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            isDisabled={isSubmitting || (isServer && !serverId)}
                        />
                        <InputRightElement scale={0.8} transform={"auto-gpu"}>
                            <IconButton
                                isDisabled={!coupon.length}
                                icon={<CheckIcon color="green" />}
                                aria-label="Check coupon"
                                onClick={handleSumit}
                                isLoading={isSubmitting}
                            />
                        </InputRightElement>
                    </InputGroup>

                    {isServer && !serverId && (
                        <Text
                            fontWeight={500}
                            color={colorMode === "light" ? "orangered" : "orange"}
                            fontSize={"sm"}
                        >
                            Please select a server to apply coupon
                        </Text>
                    )}
                </FormControl>
            )}
        </Flex>
    );
}
