import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
	Button,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	HStack,
	Icon,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Text,
	useDisclosure,
	useToast
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import Link from "~/components/utils/Link";
import { calculatePriceFromDays } from "~/components/utils/functions/payments";

export default function AddServerModal() {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<Button onClick={onOpen} variant={"brand"} rightIcon={<ArrowForwardIcon />}>
				Add Server
			</Button>

			<Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"} useInert>
				<ModalOverlay />
				<ModalContent bg="bg">
					<ModalHeader>Add Your Server</ModalHeader>
					<ModalCloseButton />
					<ModalInside onClose={onClose} />
				</ModalContent>
			</Modal>
		</>
	);
}

function ModalInside({ onClose }: { onClose?: () => void }) {
	const toast = useToast();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [state, setState] = useState<"checking" | "adding">("checking");

	const [server, setServer] = useState<string>("");
	const [icon, setIcon] = useState<string>("");
	const [days, setDays] = useState<number>(30);

	return (
		<>
			<ModalBody>
				<Flex gap={4} flexDir={"column"}>
					{state === "checking" ? (
						<>
							<FormControl isRequired>
								<FormLabel>Server address</FormLabel>
								<Input
									name="server"
									placeholder="Server address"
									variant={"filled"}
									bg="alpha"
									onChange={(e) => setServer(e.target.value)}
									value={server}
								/>
								<FormHelperText>Make sure your server is online and has a valid favicon.</FormHelperText>
							</FormControl>
						</>
					) : (
						<Flex flexDir={"column"} gap={10}>
							<HStack spacing={4}>
								<Image src={icon} boxSize={20} rounded={"sm"} />
								<Text fontWeight={600} fontSize={"2xl"}>
									{server}
								</Text>
							</HStack>

							<Flex flexDir={"column"} gap={2}>
								<Text>For how many days do you want to show your server?</Text>

								<Slider
									aria-label="slider-ex-1"
									value={days}
									onChange={(value) => setDays(value)}
									min={30}
									max={360}
									step={30}
								>
									<SliderTrack>
										<SliderFilledTrack bg="brand.900" />
									</SliderTrack>
									<SliderThumb />
								</Slider>

								<Text fontSize={"lg"} fontWeight={500}>
									{calculatePriceFromDays(days)}$ for {days} days
								</Text>
							</Flex>
						</Flex>
					)}

					<Text fontSize={"sm"}>
						By adding your server you agree to our{" "}
						<Link target="_blank" to="/tos">
							Terms of Service
						</Link>
						.
					</Text>
				</Flex>
			</ModalBody>

			<ModalFooter display={"flex"} gap={2}>
				{state === "checking" ? (
					<>
						<Button onClick={onClose}>Cancel</Button>
						<Button
							variant="brand"
							isLoading={isLoading}
							onClick={async () => {
								setIsLoading(true);
								const res = await fetch("/api/add-server", {
									method: "POST",
									body: new URLSearchParams({
										server,
										action: "check"
									}),
									headers: {
										"Content-Type": "application/x-www-form-urlencoded"
									}
								});
								const data = await res.json();
								setIsLoading(false);
								if (data?.success === false) {
									toast({
										title: "Error",
										description: data?.error,
										status: "error",
										duration: 5000,
										variant: "subtle",
										position: "bottom-right",
										isClosable: true
									});
								} else {
									setIcon(data?.data?.favicon);
									setState("adding");
								}
							}}
						>
							Check
						</Button>
					</>
				) : (
					<>
						<Button
							isLoading={isLoading}
							variant={"brand"}
							rightIcon={<Icon as={FiCreditCard} />}
							type="submit"
							name="action"
							value="add"
							onClick={async (e) => {
								setIsLoading(true);
								await fetch("/api/add-server", {
									method: "POST",
									body: new URLSearchParams({
										server,
										days: days.toString(),
										action: "add"
									}),
									redirect: "follow",
									headers: {
										"Content-Type": "application/x-www-form-urlencoded"
									},
									credentials: "include"
								}).then((res) => {
									if (res.redirected) {
										res.headers.getSetCookie().forEach((cookie) => {
											document.cookie = cookie;
										});

										navigate("payment");
										setIsLoading(false);
									} else {
										toast({
											title: "Error",
											description: "Something went wrong. Please try again.",
											status: "error",
											duration: 5000,
											variant: "subtle",
											position: "bottom-right",
											isClosable: true
										});
									}
								});
								setIsLoading(false);
							}}
						>
							Continue to payment
						</Button>
					</>
				)}
			</ModalFooter>
		</>
	);
}
