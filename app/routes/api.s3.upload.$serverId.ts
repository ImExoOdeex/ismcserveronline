import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import { updateServerImage, uploadStreamToS3 } from "@/.server/modules/s3";
import serverConfig from "@/.server/serverConfig";
import { unstable_parseMultipartFormData as parseMultipartFormData, type ActionFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
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
			// allow only images (png, jpg, jpeg, gif, webp) or videos (mp4, webm)
			if (name === "banner" || name === "background") {
				if (data instanceof Uint8Array && data.length > 10 * 1024 * 1024) {
					throw new Error("File is too large");
				}
				if (!contentType?.match(/(image\/(png|jpe?g|gif|webp))|(video\/(mp4|webm))/)) {
					throw new Error("Invalid file type");
				}

				// allow up to 10MB
				console.log("data instanceof Uint8Array", data instanceof Uint8Array, data instanceof Uint8Array && data.length);
				const random = Math.random().toString(36).substring(7);

				const extention = filename?.split(".").pop();

				function getPath(dirname: string, ext: string) {
					return `${dirname}/${random}.${ext}`;
				}

				if (name === "banner") {
					const path = getPath("banners", extention as string);

					void (await uploadStreamToS3(data, path));
					await updateServerImage("banner", path, serverId);

					return `${serverConfig.uploadsUrl}/${path}`;
				} else if (name === "background") {
					// background is a prime only feature
					if (!(server.prime || user.prime)) {
						throw new Error("User or server does not have prime");
					}

					const path = getPath("backgrounds", extention as string);

					void (await uploadStreamToS3(data, path));
					await updateServerImage("background", path, serverId);

					return `${serverConfig.uploadsUrl}/${path}`;
				}
			}

			return clonedForm.get(name);
		});

		const url = (form.get("banner")?.toString() as string) || (form.get("background")?.toString() as string);
		invariant(url, "Missing url");

		return typedjson({
			url,
			success: true
		});
	} catch (e) {
		console.error(e);
		return typedjson({
			success: false,
			message: (e as any).message
		});
	}
}
