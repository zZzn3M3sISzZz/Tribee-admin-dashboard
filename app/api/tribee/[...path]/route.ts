import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "tribee_admin_session";

function apiBase(): string {
  return (
    process.env.TRIBEE_API_URL ??
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ??
    "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
}

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tribeePath = `/v1/${params.path.join("/")}`;
  const queryString = req.nextUrl.search;
  const targetUrl = `${apiBase()}${tribeePath}${queryString}`;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "DELETE") {
    body = await req.text();
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body } : {}),
  });

  const responseBody = await upstream.text();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
