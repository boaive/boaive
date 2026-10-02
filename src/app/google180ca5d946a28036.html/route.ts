/**
 * Google Search Console ownership file. Served from a route (not public/) because
 * Cloudflare's asset handling 307-redirects `/x.html` to `/x`, which the verifier may reject.
 * Keep it: removing it unverifies the property.
 */
export function GET() {
  return new Response("google-site-verification: google180ca5d946a28036.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
