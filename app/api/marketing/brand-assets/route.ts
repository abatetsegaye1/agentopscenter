import { proxyToBackend } from "../_proxy";

export const fetchCache = "force-no-store";

export async function GET(request: Request): Promise<Response> {
  const suffix = new URL(request.url).search;
  return proxyToBackend(`/marketing/brand-assets${suffix}`, { method: "GET" });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  return proxyToBackend("/marketing/brand-assets/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  });
}
