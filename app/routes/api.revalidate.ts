import type { ActionFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export async function action(_: ActionFunctionArgs) {
    return typedjson({
        revalidate: true
    });
}
