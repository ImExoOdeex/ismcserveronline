import { db } from "@/.server/db/db";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "stream";
import { requireEnv } from "../functions/env.server";

const S3 = new S3Client({
	region: "auto",
	endpoint: requireEnv("R2_URL"),
	credentials: {
		accessKeyId: requireEnv("R2_KEY_ID"),
		secretAccessKey: requireEnv("R2_KEY_SECRET")
	}
});

const s3Config = {
	bucket: "ismcserveronline-uploads"
};

function uploadStream({ Key, total }: { Key: string; total: number }) {
	const pass = new PassThrough();

	const upload = new Upload({
		client: S3,
		params: {
			Bucket: s3Config.bucket,
			Key,
			Body: pass,
			ContentType: "image/webp",
			ACL: "public-read"
		}
	});

	upload.on("httpUploadProgress", (progress) => {
		console.log(`Progress: ${progress.loaded}/${progress.total} ${progress.part}`);
	});

	return {
		writeStream: pass,
		promise: upload.done()
	};
}

export async function uploadStreamToS3(data: Buffer, filename: string) {
	const stream = uploadStream({
		Key: filename,
		total: data.byteLength
	});

	// write buffer to stream
	stream.writeStream.write(data);
	stream.writeStream.end();

	const file = await stream.promise;
	return file.Location;
}

export async function updateServerImage(img: "banner" | "background", path: string, serverId: number) {
	const current = await db.server.findUniqueOrThrow({
		where: {
			id: serverId
		},
		select: {
			banner: true,
			background: true
		}
	});

	if (current[img]) {
		await S3.send(
			new DeleteObjectCommand({
				Bucket: s3Config.bucket,
				Key: current[img] as string
			})
		);
	}

	await db.server.update({
		where: {
			id: serverId
		},
		data: {
			[img]: path
		}
	});
}
