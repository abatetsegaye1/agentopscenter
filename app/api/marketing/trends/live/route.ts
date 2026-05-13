import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_proxy";

export const fetchCache = "force-no-store";

export async function GET(request: NextRequest): Promise<Response> {
  const search = request.nextUrl.search || "";
  return proxyToBackend(`/marketing/trends/live${search}`, { method: "GET" });
}
