import { proxyToBackend } from "../../../_proxy";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const body = await request.text();
  const taskId = encodeURIComponent(context.params.id);
  return proxyToBackend(`/marketing/tasks/${taskId}/restart`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: body || "{}"
  });
}
