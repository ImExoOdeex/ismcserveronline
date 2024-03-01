import config from "@/utils/config";

export function getFullFileUrl(file: string, type: "banner" | "background") {
	return `${config.uploadUrl}/${type}s/${file}`;
}
