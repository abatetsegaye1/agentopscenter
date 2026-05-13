import { proxyToBackend } from "../../../_proxy";

export const fetchCache = "force-no-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const body = await request.text();
  return proxyToBackend(`/marketing/brand-assets/${params.id}/activate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  });
}
