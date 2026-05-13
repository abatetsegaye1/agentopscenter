import { proxyToBackend } from "../../_proxy";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const probe = url.searchParams.get("probe");
  const suffix = probe ? `?probe=${encodeURIComponent(probe)}` : "";
  return proxyToBackend(`/marketing/integrations/readiness${suffix}`);
}
