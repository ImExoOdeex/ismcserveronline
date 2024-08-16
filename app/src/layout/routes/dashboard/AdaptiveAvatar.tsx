import { Avatar, type AvatarProps, Image, type ImageProps } from "@chakra-ui/react";
import { useState } from "react";

export default function AdaptiveAvatar({
    photo,
    name,
    ...props
}: {
    photo: string | null;
    name: string;
} & ImageProps &
    AvatarProps) {
    const [errored, setErrored] = useState(false);

    if (photo && !errored) {
        return (
            <Image
                rounded={"full"}
                src={photo}
                alt={name}
                boxSize={16}
                onError={() => {
                    setErrored(true);
                }}
                {...props}
            />
        );
    }

    return <Avatar src={photo ?? undefined} name={name} boxSize={16} {...props} />;
}
