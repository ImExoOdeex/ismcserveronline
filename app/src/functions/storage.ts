import config from "@/utils/config";

export function getFullFileUrl(file: string) {
	return `${config.uploadUrl}/${file}`;
}
