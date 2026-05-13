import { proxyToBackend } from "../_proxy";

export const fetchCache = "force-no-store";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit");
  const eventName = url.searchParams.get("eventName");
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (eventName) params.set("eventName", eventName);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return proxyToBackend(`/marketing/events${suffix}`);
}
