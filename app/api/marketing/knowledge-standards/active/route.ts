import { proxyToBackend } from "../../_proxy";

export const fetchCache = "force-no-store";

export async function GET(request: Request): Promise<Response> {
  const suffix = new URL(request.url).search || "";
  return proxyToBackend(`/marketing/knowledge-standards/active${suffix}`, { method: "GET" });
}
