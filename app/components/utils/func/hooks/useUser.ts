import { useMatches } from "@remix-run/react";

export default function useUser() {
	const { user } = useMatches()[0].data;
	console.log("user", user);

	return user as {
		id: number;
		email: string;
		snowflake: string;
		nick: string;
		photo: string | null;
		bio: string | null;
	} | null;
}
