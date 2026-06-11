import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "tribee_admin_session";

function apiBase(): string {
  return (
    process.env.TRIBEE_API_URL ??
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ??
    "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const meRes = await fetch(`${apiBase()}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json({ user: null });
  }

  const me = await meRes.json();
  if (!me.roles?.includes("ops_admin")) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: me });
}
