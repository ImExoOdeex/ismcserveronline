import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { updateServerImage, uploadStreamToS3 } from "@/.server/modules/s3";
import serverConfig from "@/.server/serverConfig";
import { unstable_parseMultipartFormData as parseMultipartFormData, type ActionFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import sharp from "sharp";
import invariant from "tiny-invariant";

export async function action({ request, params }: ActionFunctionArgs) {
	csrf(request);
	try {
		const user = await getUser(request, {
			id: true,
			prime: true
		});
		invariant(user, "User not found");

		const serverId = Number(params.serverId);
		invariant(!isNaN(serverId), "Invalid server id");

		const server = await db.server.findFirst({
			where: {
				id: serverId
			},
			select: {
				owner_id: true,
				prime: true
			}
		});
		invariant(server, "Server not found");

		const clonedForm = await request.clone().formData();

		const form = await parseMultipartFormData(request, async ({ data, name, filename, contentType }) => {
			// allow only images (png, jpg, jpeg, gif, webp)
			if (name === "banner" || name === "background") {
				if (!contentType?.match(/(image\/(png|jpe?g|gif|webp))/)) {
					throw new Error("Invalid file type");
				}

				function AsyncIterableToBuffer(iterable: AsyncIterable<Uint8Array>) {
					return new Promise<Buffer>((resolve, reject) => {
						const chunks: Uint8Array[] = [];
						let size = 0;

						(async () => {
							for await (const chunk of iterable) {
								chunks.push(chunk);
								size += chunk.length;
							}

							resolve(Buffer.concat(chunks, size));
						})().catch(reject);
					});
				}

				const buffer = await AsyncIterableToBuffer(data);

				const processed = await sharp(buffer)
					.webp({
						quality: 100
					})
					.resize(name === "banner" ? 1024 : 1920)
					.toBuffer();

				// allow up to 10MB
				console.log("size", (buffer.byteLength / 1024 / 1024).toFixed(2) + "MB");
				if (buffer.byteLength > 10 * 1024 * 1024) {
					console.log("if more than 8MB");
					throw new Error("File is too large");
				}

				const random = Math.random().toString(36).substring(7);
				const extention = filename?.split(".").pop();

				function getFilename(ext: string) {
					return `${random}.${ext}`;
				}

				function getPath(dirname: string, ext: string) {
					return `${dirname}/${getFilename(ext)}`;
				}

				if (name === "banner") {
					const file = getFilename(extention as string);
					const path = getPath("banners", extention as string);

					void (await uploadStreamToS3(processed, path));
					await updateServerImage("banner", file, serverId);

					return `${serverConfig.uploadsUrl}/${file}`;
				} else if (name === "background") {
					// background is a prime only feature
					if (!(server.prime || user.prime)) {
						throw new Error("User or server does not have prime");
					}

					const file = getFilename(extention as string);
					const path = getPath("backgrounds", extention as string);

					void (await uploadStreamToS3(processed, path));
					await updateServerImage("background", file, serverId);

					return `${serverConfig.uploadsUrl}/${file}`;
				}
			}

			return clonedForm.get(name);
		});

		const url = (form.get("banner")?.toString() as string) || (form.get("background")?.toString() as string);
		invariant(url, "Missing url");

		return typedjson({
			url,
			success: true,
			revalidate: true
		});
	} catch (e) {
		console.error(e);
		return typedjson({
			success: false,
			message: (e as any).message
		});
	}
}
