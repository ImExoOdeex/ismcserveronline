// Credit: https://github.com/PassTheMayo/minecraft-server-util/blob/master/src/structure/TCPClient.ts
import { EventEmitter } from "events";
import net, { Socket } from "net";
import { TextDecoder, TextEncoder } from "util";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf8");

export default class TCPClient extends EventEmitter {
	public isConnected = false;
	private socket: Socket | null = null;
	private data = Buffer.alloc(0);

	connect(options: net.NetConnectOpts): Promise<void> {
		return new Promise((resolve, reject) => {
			this.socket = net.createConnection(options);

			const connectHandler = () => {
				this.isConnected = true;

				this.socket?.removeListener("connect", connectHandler);
				this.socket?.removeListener("error", errorHandler);
				this.socket?.removeListener("timeout", timeoutHandler);
				this.socket?.removeListener("close", closeHandler);

				resolve();
			};

			const errorHandler = (error: Error) => {
				this.socket?.destroy();

				reject(error);
			};

			const timeoutHandler = async () => {
				this.socket?.destroy();

				reject(new Error("Server is offline or unreachable"));
			};

			const closeHandler = (hasError: boolean) => {
				this.isConnected = false;

				this.socket?.destroy();

				if (!hasError) reject();

				this.emit("close");
			};

			this.socket.on("data", (data) => {
				this.data = Buffer.concat([this.data, data]);

				this.emit("data");
			});

			this.socket.on("connect", () => connectHandler());
			this.socket.on("error", (error) => errorHandler(error));
			this.socket.on("timeout", () => timeoutHandler());
			this.socket.on("close", (hasError) => closeHandler(hasError));
		});
	}

	readByte(): Promise<number> {
		return this.readUInt8();
	}

	writeByte(value: number): void {
		this.writeUInt8(value);
	}

	async readBytes(length: number): Promise<Buffer> {
		await this.ensureBufferedData(length);

		const value = this.data.slice(0, length);

		this.data = this.data.slice(length);

		return value;
	}

	writeBytes(data: Uint8Array): void {
		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt8(): Promise<number> {
		await this.ensureBufferedData(1);

		const value = this.data.readUInt8(0);

		this.data = this.data.slice(1);

		return value;
	}

	writeUInt8(value: number): void {
		const data = Buffer.alloc(1);
		data.writeUInt8(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt8(): Promise<number> {
		await this.ensureBufferedData(1);

		const value = this.data.readInt8(0);

		this.data = this.data.slice(1);

		return value;
	}

	writeInt8(value: number): void {
		const data = Buffer.alloc(1);
		data.writeInt8(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt16BE(): Promise<number> {
		await this.ensureBufferedData(2);

		const value = this.data.readUInt16BE(0);

		this.data = this.data.slice(2);

		return value;
	}

	writeUInt16BE(value: number): void {
		const data = Buffer.alloc(2);
		data.writeUInt16BE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt16BE(): Promise<number> {
		await this.ensureBufferedData(2);

		const value = this.data.readInt16BE(0);

		this.data = this.data.slice(2);

		return value;
	}

	writeInt16BE(value: number): void {
		const data = Buffer.alloc(2);
		data.writeInt16BE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt16LE(): Promise<number> {
		await this.ensureBufferedData(2);

		const value = this.data.readUInt16LE(0);

		this.data = this.data.slice(2);

		return value;
	}

	writeUInt16LE(value: number): void {
		const data = Buffer.alloc(2);
		data.writeUInt16LE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt16LE(): Promise<number> {
		await this.ensureBufferedData(2);

		const value = this.data.readInt16LE(0);

		this.data = this.data.slice(2);

		return value;
	}

	writeInt16LE(value: number): void {
		const data = Buffer.alloc(2);
		data.writeInt16LE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt32BE(): Promise<number> {
		await this.ensureBufferedData(4);

		const value = this.data.readUInt32BE(0);

		this.data = this.data.slice(4);

		return value;
	}

	writeUInt32BE(value: number): void {
		const data = Buffer.alloc(4);
		data.writeUInt32BE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt32BE(): Promise<number> {
		await this.ensureBufferedData(4);

		const value = this.data.readInt32BE(0);

		this.data = this.data.slice(4);

		return value;
	}

	writeInt32BE(value: number): void {
		const data = Buffer.alloc(4);
		data.writeInt32BE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt32LE(): Promise<number> {
		await this.ensureBufferedData(4);

		const value = this.data.readUInt32LE(0);

		this.data = this.data.slice(4);

		return value;
	}

	writeUInt32LE(value: number): void {
		const data = Buffer.alloc(4);
		data.writeUInt32LE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt32LE(): Promise<number> {
		await this.ensureBufferedData(4);

		const value = this.data.readInt32LE(0);

		this.data = this.data.slice(4);

		return value;
	}

	writeInt32LE(value: number): void {
		const data = Buffer.alloc(4);
		data.writeInt32LE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt64BE(): Promise<bigint> {
		await this.ensureBufferedData(8);

		const value = this.data.readBigUInt64BE(0);

		this.data = this.data.slice(8);

		return value;
	}

	writeUInt64BE(value: bigint): void {
		const data = Buffer.alloc(8);
		data.writeBigUInt64BE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt64BE(): Promise<bigint> {
		await this.ensureBufferedData(8);

		const value = this.data.readBigInt64BE(0);

		this.data = this.data.slice(8);

		return value;
	}

	writeInt64BE(value: bigint): void {
		const data = Buffer.alloc(8);
		data.writeBigInt64BE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readUInt64LE(): Promise<bigint> {
		await this.ensureBufferedData(8);

		const value = this.data.readBigUInt64LE(0);

		this.data = this.data.slice(8);

		return value;
	}

	writeUInt64LE(value: bigint): void {
		const data = Buffer.alloc(8);
		data.writeBigUInt64LE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readInt64LE(): Promise<bigint> {
		await this.ensureBufferedData(8);

		const value = this.data.readBigInt64LE(0);

		this.data = this.data.slice(8);

		return value;
	}

	writeInt64LE(value: bigint): void {
		const data = Buffer.alloc(8);
		data.writeBigInt64LE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readFloatBE(): Promise<number> {
		await this.ensureBufferedData(4);

		const value = this.data.readFloatBE(0);

		this.data = this.data.slice(4);

		return value;
	}

	writeFloatBE(value: number): void {
		const data = Buffer.alloc(4);
		data.writeFloatBE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readFloatLE(): Promise<number> {
		await this.ensureBufferedData(4);

		const value = this.data.readFloatLE(0);

		this.data = this.data.slice(4);

		return value;
	}

	writeFloatLE(value: number): void {
		const data = Buffer.alloc(4);
		data.writeFloatLE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readDoubleBE(): Promise<number> {
		await this.ensureBufferedData(8);

		const value = this.data.readDoubleBE(0);

		this.data = this.data.slice(8);

		return value;
	}

	writeDoubleBE(value: number): void {
		const data = Buffer.alloc(8);
		data.writeDoubleBE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readDoubleLE(): Promise<number> {
		await this.ensureBufferedData(8);

		const value = this.data.readDoubleLE(0);

		this.data = this.data.slice(8);

		return value;
	}

	writeDoubleLE(value: number): void {
		const data = Buffer.alloc(8);
		data.writeDoubleLE(value);

		this.data = Buffer.concat([this.data, data]);
	}

	async readVarInt(): Promise<number> {
		return await readVarInt(() => this.readByte());
	}

	writeVarInt(value: number): void {
		this.writeBytes(writeVarInt(value));
	}

	async readString(length: number): Promise<string> {
		const data = await this.readBytes(length);

		return decoder.decode(data);
	}

	writeString(value: string): void {
		this.writeBytes(encoder.encode(value));
	}

	async readStringVarInt(): Promise<string> {
		const length = await this.readVarInt();
		const data = await this.readBytes(length);

		return decoder.decode(data);
	}

	writeStringVarInt(value: string): void {
		const data = encoder.encode(value);

		this.writeVarInt(data.byteLength);
		this.writeBytes(data);
	}

	async readStringNT(): Promise<string> {
		let buf = Buffer.alloc(0);
		let value;

		while ((value = await this.readByte()) !== 0x00) {
			buf = Buffer.concat([buf, Buffer.from([value])]);
		}

		return decoder.decode(buf);
	}

	writeStringNT(value: string): void {
		const data = encoder.encode(value);

		this.writeBytes(data);
		this.writeByte(0x00);
	}

	writeStringBytes(value: string): void {
		this.writeBytes(encoder.encode(value));
	}

	async readStringUntil(byte: number): Promise<string> {
		let buf = Buffer.alloc(0);
		let value;

		while ((value = await this.readByte()) !== byte) {
			buf = Buffer.concat([buf, Buffer.from([value])]);
		}

		return decoder.decode(buf);
	}

	flush(prefixLength = true): Promise<void> {
		if (!this.socket) return Promise.resolve();

		return new Promise((resolve, reject) => {
			let buf = this.data;

			if (prefixLength) {
				buf = Buffer.concat([writeVarInt(buf.byteLength), buf]);
			}

			this.socket?.write(buf, (error) => {
				if (error) return reject(error);

				resolve();
			});

			this.data = Buffer.alloc(0);
		});
	}

	close(): void {
		this.socket?.removeAllListeners();
		this.socket?.end();
		this.socket?.destroy();
	}

	async ensureBufferedData(byteLength: number): Promise<void> {
		if (this.data.byteLength >= byteLength) return Promise.resolve();

		return this._waitForData(byteLength);
	}

	_waitForData(byteLength = 1): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const dataHandler = () => {
				if (this.data.byteLength >= byteLength) {
					this.removeListener("data", dataHandler);
					this.removeListener("close", closeHandler);

					resolve();
				}
			};

			const closeHandler = () => {
				this.removeListener("data", dataHandler);
				this.removeListener("close", closeHandler);

				reject(new Error("Socket closed unexpectedly while waiting for data"));
			};

			this.on("data", () => dataHandler());
			this.on("close", () => closeHandler());
		});
	}
}

async function readVarInt(readByte: () => Promise<number>): Promise<number> {
	let numRead = 0;
	let result = 0;
	let read: number, value: number;

	do {
		if (numRead > 4) throw new Error("VarInt exceeds data bounds");

		read = await readByte();
		value = read & 0b01111111;
		result |= value << (7 * numRead);

		numRead++;

		if (numRead > 5) throw new Error("VarInt is too big");
	} while ((read & 0b10000000) != 0);

	return result;
}

function writeVarInt(value: number): Buffer {
	let buf = Buffer.alloc(0);

	do {
		let temp = value & 0b01111111;

		value >>>= 7;

		if (value != 0) {
			temp |= 0b10000000;
		}

		buf = Buffer.concat([buf, Buffer.from([temp])]);
	} while (value != 0);

	return buf;
}
