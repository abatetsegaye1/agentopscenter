import { proxyToBackend } from "../../_proxy";

export const fetchCache = "force-no-store";

export async function GET(): Promise<Response> {
  return proxyToBackend("/marketing/brand-assets/colors", { method: "GET" });
}
