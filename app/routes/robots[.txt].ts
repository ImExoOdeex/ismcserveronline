export async function loader() {
    return new Response(
        `User-agent: *
Allow: /

Sitemap: https://www.example.com/sitemap.xml`, {
        status: 200,
        headers: {
            "Content-Type": "application/text",
        }
    }
    )
};


