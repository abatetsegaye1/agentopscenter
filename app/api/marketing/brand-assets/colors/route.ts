import { proxyToBackend } from "../../_proxy";

export async function GET(): Promise<Response> {
  return proxyToBackend("/marketing/brand-assets/colors", { method: "GET" });
}
