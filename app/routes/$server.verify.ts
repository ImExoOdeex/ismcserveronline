import { type LoaderFunctionArgs, redirectDocument } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const newUrl = url.toString().replace("verify", "vote") + "?verify";

    return redirectDocument(newUrl);
}
