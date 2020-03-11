const ALLOWED_ORIGINS = ["https://hubs.ieeevr.online"];
const ALLOWED_HOSTNAMES = ["localhost", "hubs.local", "xip.io"]
const CORS_PROXY_HOST = "https://hubs-ieeevr-hubs-internal-net-cors-proxy.ieeevr2020.workers.dev";
const PROXY_HOST = "https://hubs-ieeevr-hubs-internal-net-proxy.ieeevr2020.workers.dev";
const HUB_HOST = "https://hubs.ieeevr.online";
const ASSETS_HOST = "https://ieeevr-assets-9e9a50a0.s3.us-east-1.amazonaws.com";

addEventListener("fetch", e => {
  const request = e.request;
  const origin = request.headers.get("Origin");
  // eslint-disable-next-line no-useless-escape

  const isCorsProxy = request.url.indexOf(CORS_PROXY_HOST) === 0;
  const proxyUrl = new URL(isCorsProxy ? CORS_PROXY_HOST : PROXY_HOST);
  const targetPath = request.url.substring((isCorsProxy ? CORS_PROXY_HOST : PROXY_HOST).length + 1);
  let targetUrl;

  if (targetPath.startsWith("files/") || targetPath.startsWith("thumbnail/")) {
    targetUrl = `${HUB_HOST}/${targetPath}`;
  } else if (targetPath.startsWith("hubs/") || targetPath.startsWith("spoke/") || targetPath.startsWith("admin/") || targetPath.startsWith("assets/")) {
    targetUrl = `${ASSETS_HOST}/${targetPath}`;
  } else {
    if (!isCorsProxy) {
      // Do not allow cors proxying from main domain, always require cors-proxy. subdomain to ensure CSP stays sane.
      return;
    }
    // This is a weird workaround that seems to stem from the cloudflare worker receiving the wrong url
    targetUrl = targetPath.replace(/^http(s?):\/([^/])/, "http$1://$2");

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = proxyUrl.protocol + "//" + targetUrl;
    }
  }
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("Origin"); // Some domains disallow access from improper Origins

  e.respondWith((async () => {
    const res = await fetch(targetUrl, { headers: requestHeaders, method: request.method, redirect: "manual", referrer: request.referrer, referrerPolicy: request.referrerPolicy });      
    const responseHeaders = new Headers(res.headers);
    const redirectLocation = responseHeaders.get("Location") || responseHeaders.get("location");

    if(redirectLocation) {
      if (!redirectLocation.startsWith("/")) {
        responseHeaders.set("Location",  proxyUrl.protocol + "//" + proxyUrl.host + "/" + redirectLocation);
      } else {
        const tUrl = new URL(targetUrl);
        responseHeaders.set("Location",  proxyUrl.protocol + "//" + proxyUrl.host + "/" + tUrl.origin + redirectLocation);
      }
    }

    const hostname = new URL(origin).hostname
    if (origin && (ALLOWED_ORIGINS.indexOf(origin) >= 0 || ALLOWED_HOSTNAMES.indexof(hostname) >= 0)) {
      responseHeaders.set("Access-Control-Allow-Origin", origin);
      responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "Range");
      responseHeaders.set("Access-Control-Expose-Headers", "Accept-Ranges, Content-Encoding, Content-Length, Content-Range, Hub-Name, Hub-Entity-Type");
    }

    responseHeaders.set("Vary", "Origin");
    responseHeaders.set('X-Content-Type-Options', "nosniff");

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: responseHeaders });  
  })());
});