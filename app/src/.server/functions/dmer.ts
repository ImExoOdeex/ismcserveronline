import serverConfig from "../serverConfig";
import { requireEnv } from "./env.server";

// it's just dming me on dc about new subs
export async function newSubscriptionNotify(
    username: string,
    email: string,
    avatar?: string | null
) {
    const res = await fetch(`${serverConfig.botApi}/dm/prime`, {
        method: "POST",
        headers: {
            Authorization: requireEnv("SUPER_DUPER_API_ACCESS_TOKEN")
        },
        body: new URLSearchParams({
            username,
            email,
            avatar: avatar ?? ""
        })
    }).catch((e) => {
        console.error("error dming about new sub", e);
        return null;
    });
    if (!res) return;
    console.log("newSubscriptionNotify", await res.json());
}
