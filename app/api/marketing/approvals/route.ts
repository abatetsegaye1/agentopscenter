import { NextRequest } from "next/server";
import { proxyToBackend } from "../_proxy";

export const fetchCache = "force-no-store";

export async function GET(request: NextRequest): Promise<Response> {
  const limit = request.nextUrl.searchParams.get("limit");
  const suffix = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  return proxyToBackend(`/marketing/approvals${suffix}`, { method: "GET" });
}
