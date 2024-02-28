import { webcrypto as crypto } from "crypto"; // using webcrypto, cause i like web api more lol. and i can easier port it to cf or whatever. or bun idk
import { requireEnv } from "../functions/env.server";

const key = requireEnv("ENCRYPTION_KEY");
const algorithm = "AES-CBC";
const textEncoder = new TextEncoder();
const defaultIv = textEncoder.encode("0000000000000000");

const keyBuffer = await crypto.subtle.importKey("raw", textEncoder.encode(key), { name: algorithm }, false, [
	"encrypt",
	"decrypt"
]);

export async function encrypt(data: string) {
	const cipher = await crypto.subtle.encrypt(
		{
			name: algorithm,
			iv: defaultIv
		},
		keyBuffer,
		new TextEncoder().encode(data)
	);

	const encryptedHex = Array.from(new Uint8Array(cipher))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");

	return encryptedHex;
}

export async function decrypt(encryptedHex: string) {
	const textDecoder = new TextDecoder();

	const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

	const decrypted = await crypto.subtle.decrypt(
		{
			name: algorithm,
			iv: defaultIv
		},
		keyBuffer,
		encryptedArray
	);

	const decryptedHex = textDecoder.decode(decrypted);

	return decryptedHex;
}
