export function isAddress(address: string) {
	const isValidAddress = address.match(
		/^(?:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(:[0-9]{1,5})?$/
	);
	const isValidDomain = address.match(/^(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})?(:[0-9]{1,5})?$/);
	return isValidAddress || isValidDomain;
}
