export function validateServer(server: string) {
	if (server.length > 253) {
		return "Server domain is too long!";
	} else if (server.length < 4) {
		return "Server domain is too short!";
	}

	return null;
}
