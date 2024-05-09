import type { IPlan } from "@/types/typings";

const plans = [
    {
        type: "server",
        title: "Server Prime",
        description: "For invidual server",
        price: 3.49,
        ad_credits: 20,
        color: "sec.900" as const,
        features: [
            "Custom background image",
            "Unlocked every plugin feature",
            "Up to 100k API checks/month for selected server",
            "Double user votes on weekends for server",
            "20 free Ad credits"
        ]
    },
    {
        type: "user",
        title: "User Prime",
        description: "For user & all owned servers",
        price: 5.49,
        ad_credits: 30,
        color: "brand.900" as const,
        features: [
            "Everything from Server Prime",
            "Max livecheck slots",
            "Up to 100k API checks/month for every server",
            "Double voting on weekends for all servers",
            "30 free Ad credits"
        ]
    }
] satisfies IPlan[];

export default plans;
