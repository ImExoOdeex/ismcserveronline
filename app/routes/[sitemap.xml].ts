export async function loader() {
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
	  <loc>https://ismcserver.online/</loc>
	  <lastmod>2022-12-28T19:26:48+01:00</lastmod>
	  <priority>1.0</priority>
  </url>
  <url>
	  <loc>https://ismcserver.online/faq</loc>
	  <lastmod>2022-12-28T19:26:48+01:00</lastmod>
	  <priority>1.0</priority>
  </url>
  </urlset>
  `,
		{
			status: 200,
			headers: {
				"Content-Type": "application/xml"
			}
		}
	);
}
