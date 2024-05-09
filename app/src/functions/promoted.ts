import type { PromotedViewType } from "@prisma/client";

export function sendPromotedAction(type: PromotedViewType, id: number) {
    fetch("/api/promoted/view", {
        method: "PUT",
        body: new URLSearchParams({
            id: id.toString(),
            type
        })
    })
        .then((res) => {
            if (res.ok) {
                return res.json().then(console.info);
            }
        })
        .catch(console.error);
}
