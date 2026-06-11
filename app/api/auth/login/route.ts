import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "tribee_admin_session";
const REFRESH_COOKIE = "tribee_admin_refresh";
const COOKIE_MAX_AGE = 8 * 60 * 60;

function apiBase(): string {
  return (
    process.env.TRIBEE_API_URL ??
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ??
    "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const upstream = await fetch(`${apiBase()}/v1/auth/login/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload.error ?? "Authentication failed" },
      { status: upstream.status }
    );
  }

  const accessToken = payload.access_token as string | undefined;
  const refreshToken = payload.refresh_token as string | undefined;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token returned" }, { status: 500 });
  }

  const meRes = await fetch(`${apiBase()}/v1/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const me = await meRes.json().catch(() => ({}));
  if (!meRes.ok || !me.roles?.includes("ops_admin")) {
    return NextResponse.json(
      { error: "Access denied — ops_admin role required" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  if (refreshToken) {
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  }
  return response;
}
