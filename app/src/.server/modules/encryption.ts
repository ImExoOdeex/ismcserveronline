import { webcrypto as crypto } from "node:crypto"; // using webcrypto, cause i like web api more lol. and i can easier port it to cf or whatever. or bun idk
import invariant from "tiny-invariant";
import { requireEnv } from "../functions/env.server";

const key = requireEnv("ENCRYPTION_KEY");
const algorithm = "AES-CBC";
const textEncoder = new TextEncoder();
const defaultIv = textEncoder.encode("0000000000000000");

let keyBuffer: CryptoKey | undefined;

crypto.subtle
    .importKey("raw", textEncoder.encode(key), { name: algorithm }, false, ["encrypt", "decrypt"])
    .then((key) => {
        keyBuffer = key;
    });

export async function encrypt(data: string) {
    invariant(keyBuffer, "Key buffer is not defined");
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
    invariant(keyBuffer, "Key buffer is not defined");
    const textDecoder = new TextDecoder();

    const encryptedArray = new Uint8Array(
        encryptedHex.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16))
    );

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
