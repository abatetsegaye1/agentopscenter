import { proxyToBackend } from "../../../_proxy";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const body = await request.text();
  const id = encodeURIComponent(context.params.id);
  return proxyToBackend(`/marketing/knowledge-standards/${id}/archive`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-role": request.headers.get("x-user-role") ?? "admin"
    },
    body: body || "{}"
  });
}
