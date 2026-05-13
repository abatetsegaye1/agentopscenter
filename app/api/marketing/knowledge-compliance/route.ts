import { proxyToBackend } from "../_proxy";

export async function GET(request: Request): Promise<Response> {
  const suffix = new URL(request.url).search || "";
  return proxyToBackend(`/marketing/knowledge-compliance${suffix}`, { method: "GET" });
}
