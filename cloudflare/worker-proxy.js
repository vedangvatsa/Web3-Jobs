/** Workers Free: reverse-proxy mirror to hashtagweb3.com on workers.dev. */
const ORIGIN = "https://hashtagweb3.com";

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (incoming.pathname === "/") {
      return Response.redirect(new URL("/jobs", incoming), 302);
    }
    const target = new URL(incoming.pathname + incoming.search, ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("x-hashtagweb3-mirror", "cloudflare-workers");
    headers.delete("host");
    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }
    const response = await fetch(target.toString(), init);
    const out = new Response(response.body, response);
    out.headers.set("x-hashtagweb3-mirror", "cloudflare-workers");
    return out;
  },
};