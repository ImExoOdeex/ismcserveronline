import { Flex, Icon, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { FaFileUpload } from "react-icons/fa";

export default function DragAndDropFile() {
	const [isDropping, setIsDropping] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [success, setSuccess] = useState(false);

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

	const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDropping(false);
		setIsUploading(true);
		setPreview(null);
		setSuccess(false);
		const file = e.dataTransfer.files[0];

		// accept only images and videos and audios
		if (!file.type.startsWith("image")) {
			toast({
				title: "Invalid file type",
				description: "Only images are allowed",
				status: "error"
			});
			setIsUploading(false);
			return;
		}

		// max file size is 50MB
		const mbLimit = 15;
		if (file.size > mbLimit * 1024 * 1024) {
			toast({
				title: "File is too large",
				description: "Max file size is 15MB",
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

		// upload to the api
		const type: any = file.type.startsWith("image") ? "Image" : null;
		if (!type) {
			toast({
				title: "File type not found",
				description: "Please try again",
				status: "error"
			});
			setIsUploading(false);
			return;
		}
		const body = new FormData();
		body.append("filename", file.name);
		body.append("type", type);
		body.append("size", file.size.toString());
		body.append("file", file);

		// const res = (await fetch("/api/cdn/upload", {
		// 	method: "PUT",
		// 	body,
		// 	headers: {
		// 		Accept: "*/*"
		// 	}
		// }).then(async (res) => {
		// 	const text = await res.text();

		// 	try {
		// 		return JSON.parse(text);
		// 	} catch (e) {
		// 		console.error(e);
		// 		return text;
		// 	}
		// })) as { url: string; success: boolean; asset: Asset };

		setIsUploading(false);
		setSuccess(true);
		// setAssets((prev) => [res.asset, ...prev]);
		// console.log("upload res", res);
	}, []);

	const color = isDropping ? "brand" : success ? "green" : "alpha300";
	const colorInside = isDropping ? "brand" : success ? "green" : "alpha500";

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
