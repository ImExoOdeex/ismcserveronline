export async function loader() {
    return new Response(
        `User-agent: *
Allow: /

Sitemap: https://ismcserver.online/sitemap.xml`, {
        status: 200,
        headers: {
            "Content-Type": "application/text",
        }
    }
    )
};


