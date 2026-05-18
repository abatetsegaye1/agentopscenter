import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE = "https://opsapi.digitalrealestate.today/api";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");

export const fetchCache = "force-no-store";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.text();
    const response = await fetch(`${API_BASE}/auth/password`, {
      method: "POST",
      headers: {
        authorization: request.headers.get("authorization") ?? "",
        "content-type": request.headers.get("content-type") ?? "application/json"
      },
      body,
      cache: "no-store"
    });
    const responseBody = await response.text();
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    return new NextResponse(responseBody, { status: response.status, headers });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Password update proxy failed" },
      { status: 502 }
    );
  }
}
