import config from "@/utils/config";

export function isObject(value: any): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

export function areSameObjects<T extends Record<string, unknown>>(a: T, b: T): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function copyObjectWithoutKeys<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	const newObj = { ...obj };
	for (const key of keys) {
		delete newObj[key];
	}
	return newObj;
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function invariant(condition: unknown, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export function getResizedUrl(path: string, width?: number, height?: number): string {
	// return path;
	return `${config.dashUrl}/cdn-cgi/image/${width ? `width=${width},` : ""}${
		height ? `height=${height},` : ""
	}quality=100${path}`;
}

export function normalizeTag(tag: string) {
	// replace all -, _, and spaces with a single space
	return tag.replace(/[-_ ]+/g, " ").trim();
}

export function removePortFromHost(host: string): string {
	return host.split(":")[0];
}
