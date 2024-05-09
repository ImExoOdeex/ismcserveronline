import config from "@/utils/config";

class analytics {
    static async sendEvent(props: Record<string, any>) {
        return await fetch(config.analyticsUrl + "/api/event", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(props)
        }).then((res) => res.text());
    }

    static pageView() {
        analytics.sendEvent({
            name: "pageview",
            url: window.location.href,
            referrer: document.referrer,
            domain: window.location.hostname
        });
    }
}

export default analytics;
