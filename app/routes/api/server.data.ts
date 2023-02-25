import { type LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
	if (!process.env.API_TOKEN) throw new Error("API_TOKEN is not definied!");

	const url = new URL(request.url);
	const server = url.searchParams.get("server");
	if (!server) {
		return "no server given!";
	}

	const data: any = await (
		await fetch(`https://api.ismcserver.online/${server}`, {
			method: "get",
			headers: [["Authorization", process.env.API_TOKEN]]
		})
	).json();

	return { data, server };
}
