export const fetchCache = "force-no-store";

export function GET(): Response {
  return Response.json({
    ok: true,
    service: "agentops-frontend",
    timestamp: new Date().toISOString()
  });
}
