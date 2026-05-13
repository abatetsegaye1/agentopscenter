import { proxyToBackend } from "../../../_proxy";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const body = await request.text();
  const campaignId = encodeURIComponent(context.params.id);
  return proxyToBackend(`/marketing/campaigns/${campaignId}/approve`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-role": request.headers.get("x-user-role") ?? "marketing_manager"
    },
    body: body || "{}"
  });
}
