export function hexToDecimal(hexString: string): number {
	hexString = hexString.replace("#", "");
	if (!/^[0-9A-Fa-f]+$/.test(hexString)) {
		// throw new Error("Invalid hex string");
		return 0;
	}

	const decimalValue = parseInt(hexString, 16);

	return decimalValue;
}

export function decimalToHex(decimalNumber: number): string {
	if (!Number.isInteger(decimalNumber) || decimalNumber < 0) {
		// throw new Error("Invalid decimal number");
		return "#000000";
	}

	const hexString = decimalNumber.toString(16).toUpperCase();

	return "#" + hexString;
}
