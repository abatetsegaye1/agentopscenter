import { NextResponse } from "next/server";

const DEFAULT_API_BASE = "https://opsapi.digitalrealestate.today/api";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");

function toBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

export async function proxyToBackend(path: string, init?: RequestInit): Promise<NextResponse> {
  try {
    const response = await fetch(toBackendUrl(path), {
      ...init,
      cache: "no-store"
    });

    const body = await response.text();
    const contentType = response.headers.get("content-type");
    const headers = new Headers();

    if (contentType) {
      headers.set("content-type", contentType);
    }

    return new NextResponse(body, {
      status: response.status,
      headers
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy error";
    return NextResponse.json(
      {
        message: `Marketing API proxy request failed: ${message}`
      },
      {
        status: 502
      }
    );
  }
}
