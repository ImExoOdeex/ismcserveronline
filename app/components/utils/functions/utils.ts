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
