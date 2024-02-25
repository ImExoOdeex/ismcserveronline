import config from "~/components/config/config";

export function getFullFileUrl(file: string) {
	return `${config.bucketUrl}/${file}`;
}
