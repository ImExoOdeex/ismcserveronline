import { Flex, Icon, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useCallback, useState } from "react";
import { FaFileUpload } from "react-icons/fa";

interface Props {
	fileName: string;
	serverId: number;
}

export default function DragAndDropFile({ fileName, serverId }: Props) {
	const [isDropping, setIsDropping] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [state, setState] = useState<"idle" | "success" | "error">("idle");

	const toast = useToast();

	const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDropping(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDropping(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	const fetcher = useFetcher();
	const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		(async () => {
			e.preventDefault();
			setIsDropping(false);
			setIsUploading(true);
			setPreview(null);
			setState("idle");
			const file = e.dataTransfer.files[0];

			// accept only images and videos
			if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
				toast({
					title: "Invalid file type",
					description: "Only images or videos are allowed",
					status: "error"
				});
				setIsUploading(false);
				return;
			}

			// max file size is 10MB
			const mbLimit = 10;

			if (file.size > mbLimit * 1024 * 1024) {
				toast({
					title: "File is too large",
					description: `Max file size is ${mbLimit}MB`,
					status: "error"
				});
				setIsUploading(false);
				return;
			}

			setFile(file);

			// set preview
			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);

			const body = new FormData();
			body.append(fileName, file);

			const res = await fetch(`/api/s3/upload/${serverId}`, {
				method: "PUT",
				body
			}).then((res) => res.json());

			console.log("res", res);

			if (!res.success) {
				toast({
					title: "Upload failed",
					description: res.message,
					status: "error"
				});

				setIsUploading(false);
				setState("error");

				return;
			} else {
				fetcher.submit(null, {
					action: "/api/revalidate",
					method: "POST"
				});
			}

			setIsUploading(false);
			setState("success");
			// setAssets((prev) => [res.asset, ...prev]);
			// console.log("upload res", res);
		})();
	}, []);

	const color = isDropping ? "brand" : state === "success" ? "green" : state === "error" ? "red" : "alpha300";
	const colorInside = isDropping ? "brand" : state === "success" ? "green" : state === "error" ? "red" : "alpha500";

	return (
		<>
			<Flex
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				onClick={() => {
					const input = document.createElement("input");
					input.type = "file";
					input.accept = "image/*, video/*, audio/*";
					input.onchange = (e) => {
						const file = (e.target as HTMLInputElement).files?.[0];

						const handleDropEvent = new Event("drop", {
							bubbles: true,
							cancelable: true
						});

						// @ts-ignore
						handleDropEvent.dataTransfer = {
							files: [file]
						};

						handleDrop(handleDropEvent as any);
					};
					input.click();
				}}
				cursor={"pointer"}
				_hover={{
					borderColor: "alpha500"
				}}
				transition={"all 0.1s ease-in-out"}
				p={5}
				rounded="lg"
				border="2px dashed"
				borderColor={color}
				w="100%"
				alignItems={"center"}
				justifyContent={"center"}
				zIndex={1}
				flexDir={"column"}
				gap={2}
			>
				{(preview && file?.type.startsWith("image")) || isUploading ? (
					<Flex position={"relative"} h={8} overflow={"hidden"} w="100%">
						{file?.type.startsWith("image") && (
							<Image src={preview as string} h={8} mx={"auto"} objectFit={"cover"} rounded={"md"} />
						)}

						{isUploading && (
							<Spinner position={"absolute"} top={0} left={0} right={0} bottom={0} m={"auto"} color={colorInside} />
						)}
					</Flex>
				) : (
					<Icon as={FaFileUpload} boxSize={8} zIndex={0} color={colorInside} pointerEvents={"none"} />
				)}

				<Text zIndex={0} color={colorInside} pointerEvents={"none"} fontWeight={600}>
					{file ? file.name : isDropping ? "Drop here" : "Drag and drop file here"}
				</Text>
			</Flex>
		</>
	);
}
