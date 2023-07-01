import { Avatar, Image, type AvatarProps, type ImageProps } from "@chakra-ui/react";

export default function AdaptiveAvatar({
	photo,
	name,
	...props
}: {
	photo: string | null;
	name: string;
} & ImageProps &
	AvatarProps) {
	if (photo) {
		return <Image rounded={"full"} src={photo} alt={name} boxSize={16} {...props} />;
	}

	return <Avatar src={photo ?? ""} name={name} boxSize={16} {...props} />;
}
